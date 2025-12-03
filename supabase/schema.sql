-- CEO Dashboard Database Schema
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users profile table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ceo', 'employee')),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_value NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT '%',
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'on_track', 'at_risk', 'off_track', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress table
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create uploads table for proof submissions
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  url TEXT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (url IS NOT NULL OR file_path IS NOT NULL)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_goals_department_id ON public.goals(department_id);
CREATE INDEX IF NOT EXISTS idx_goals_owner_user_id ON public.goals(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_progress_goal_id ON public.progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_goal_id ON public.uploads(goal_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON public.uploads(user_id);

-- Insert default departments (8 departments as per requirements)
INSERT INTO public.departments (name) VALUES
  ('Sales'),
  ('Revenue'),
  ('Marketing'),
  ('Product Performance'),
  ('Support'),
  ('Growth'),
  ('DevOps'),
  ('Compliance')
ON CONFLICT (name) DO NOTHING;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- Departments: Everyone can read
CREATE POLICY "Departments are viewable by authenticated users" ON public.departments
  FOR SELECT
  TO authenticated
  USING (true);

-- Users: Users can read their own profile and CEO can read all
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "CEO can view all users" ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'ceo'
    )
  );

-- Users: Only admins/system can insert (typically done via triggers or app logic)
CREATE POLICY "CEO can insert users" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'ceo'
    )
  );

-- Goals: CEO can do everything, employees can read goals in their department
CREATE POLICY "CEO can manage all goals" ON public.goals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'ceo'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'ceo'
    )
  );

CREATE POLICY "Employees can view goals in their department" ON public.goals
  FOR SELECT
  TO authenticated
  USING (
    department_id IN (
      SELECT department_id FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'employee'
    )
  );

-- Progress: Employees can insert progress for their goals, CEO can read all
CREATE POLICY "CEO can view all progress" ON public.progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'ceo'
    )
  );

CREATE POLICY "Employees can view progress in their department" ON public.progress
  FOR SELECT
  TO authenticated
  USING (
    goal_id IN (
      SELECT id FROM public.goals
      WHERE department_id IN (
        SELECT department_id FROM public.users
        WHERE auth_user_id = auth.uid() AND role = 'employee'
      )
    )
  );

CREATE POLICY "Employees can insert their own progress" ON public.progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Uploads: Similar to progress
CREATE POLICY "CEO can view all uploads" ON public.uploads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'ceo'
    )
  );

CREATE POLICY "Employees can view uploads in their department" ON public.uploads
  FOR SELECT
  TO authenticated
  USING (
    goal_id IN (
      SELECT id FROM public.goals
      WHERE department_id IN (
        SELECT department_id FROM public.users
        WHERE auth_user_id = auth.uid() AND role = 'employee'
      )
    )
  );

CREATE POLICY "Employees can insert their own uploads" ON public.uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update goals.updated_at
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket setup instructions:
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create a new bucket called "proof_uploads"
-- 3. Set it to private (authenticated users only)
-- 4. Add policies:
--    - Authenticated users can upload: INSERT with auth.uid() check
--    - CEO can view all, employees can view their department's uploads

-- After running this schema, create a CEO user:
-- 1. Sign up a user via your app or Supabase Auth
-- 2. Get the user's ID from auth.users table
-- 3. Insert into public.users:
--    INSERT INTO public.users (auth_user_id, full_name, role, department_id)
--    VALUES ('USER_AUTH_ID_HERE', 'CEO Name', 'ceo', NULL);
