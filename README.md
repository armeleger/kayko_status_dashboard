# CEO Dashboard - Full-Stack Web Application

A modern, fully functional CEO Dashboard built with **Next.js**, **TypeScript**, **TailwindCSS**, and **Supabase**. This application enables comprehensive goal tracking, performance monitoring, and progress management across multiple departments with role-based access control.

## 🚀 Features

### For CEOs
- **Executive Overview**: Real-time insights across all 8 departments (Sales, Revenue, Marketing, Product Performance, Support, Growth, DevOps, Compliance)
- **Visual Analytics**: Interactive charts and KPIs with Recharts visualizations
- **Goal Management**: Create, edit, and assign goals to employees
- **Progress Tracking**: Monitor employee submissions and track goal completion in real-time
- **Department Performance**: View aggregated metrics and health status per department

### For Employees
- **Department Dashboard**: Focused view on assigned department and goals
- **Progress Submission**: Update goal progress with notes
- **Proof Upload**: Submit evidence via URL links or file uploads
- **Goal Visibility**: View all department goals and track personal assignments

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Charts**: Recharts
- **Authentication**: Supabase Auth with email/password

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Supabase Account** (free tier works)
- Git (for cloning)

## 🔧 Installation & Setup

### 1. Clone the Repository

This repository is already cloned. You're in the project directory!

### 2. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Wait for the database to initialize (takes ~2 minutes)

#### Get Your Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** and **anon/public key**

#### Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/schema.sql` from this project
4. Paste and run the SQL in the Supabase SQL Editor
5. This will create all tables, indexes, RLS policies, and insert the 8 default departments

#### Set Up Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `proof_uploads`
3. Set it to **Private** (authenticated users only)
4. Add storage policies:
   - **INSERT**: Allow authenticated users to upload files
   - **SELECT**: Allow CEO to view all, employees to view their department's uploads

### 4. Create Users

#### Create a CEO User

1. Go to **Authentication** → **Users** in Supabase
2. Click **Add User** and create an account (e.g., `ceo@example.com`)
3. Go to **SQL Editor** and run:

```sql
INSERT INTO public.users (auth_user_id, full_name, role, department_id)
VALUES ('PASTE_USER_ID_HERE', 'CEO Name', 'ceo', NULL);
```

Replace `PASTE_USER_ID_HERE` with the actual user ID from the auth.users table.

#### Create Employee Users

1. Create employee accounts via Authentication → Users
2. Insert their profiles:

```sql
-- Get a department ID first
SELECT id, name FROM public.departments;

-- Insert employee profile
INSERT INTO public.users (auth_user_id, full_name, role, department_id)
VALUES ('EMPLOYEE_USER_ID', 'Employee Name', 'employee', 'DEPARTMENT_ID_HERE');
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You'll be redirected to `/login`. Use the credentials you created in Supabase!

## 📁 Project Structure

```
kayko_status_dashboard/
├── app/
│   ├── api/                      # API routes
│   │   ├── dashboard/summary/    # Dashboard metrics API
│   │   ├── goals/                # Goals CRUD API
│   │   └── profile/              # User profile API
│   ├── dashboard/
│   │   ├── ceo/                  # CEO dashboard page
│   │   ├── employee/             # Employee dashboard page
│   │   ├── goals/                # Goal management pages
│   │   └── layout.tsx            # Dashboard layout with auth
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home (redirects to login)
├── components/
│   ├── charts/                   # Recharts components
│   │   ├── DepartmentPerformanceChart.tsx
│   │   ├── GoalProgressChart.tsx
│   │   └── HealthDonut.tsx
│   ├── GoalList.tsx              # Goals table component
│   ├── KpiCard.tsx               # KPI display card
│   ├── ProgressBar.tsx           # Progress bar component
│   ├── SectionCard.tsx           # Section container
│   ├── Sidebar.tsx               # Navigation sidebar
│   └── TopBar.tsx                # Top navigation bar
├── hooks/
│   └── useAuth.ts                # Authentication hook
├── lib/
│   ├── supabaseClient.ts         # Browser Supabase client
│   ├── supabaseServer.ts         # Server Supabase client
│   └── types.ts                  # TypeScript types
├── supabase/
│   └── schema.sql                # Database schema
├── .env.local.example            # Environment variables template
└── README.md                     # This file
```

## 🎯 Usage Guide

### As a CEO

1. **Login** at `/login` with CEO credentials
2. **View Dashboard** at `/dashboard/ceo`
   - See global KPIs across all departments
   - Review department-specific performance
   - Check goal health distribution
3. **Create Goals** via sidebar → "Create Goal"
   - Assign to departments and employees
   - Set target values, dates, and units
4. **Edit Goals** by clicking "Edit" on any goal in the dashboard
5. **Monitor Progress** in real-time as employees submit updates

### As an Employee

1. **Login** at `/login` with employee credentials
2. **View Dashboard** at `/dashboard/employee`
   - See your assigned goals
   - View all goals in your department
3. **Submit Progress**
   - Click "Submit Progress Update"
   - Select goal, enter progress value
   - Add notes and upload proof (URL or file)
4. Progress automatically updates goal completion

## 🗂️ Database Schema

### Tables

- **departments**: 8 predefined departments
- **users**: User profiles linked to Supabase auth
- **goals**: Goals with targets, deadlines, and status
- **progress**: Progress entries submitted by employees
- **uploads**: Proof uploads (URL or file references)

### Row-Level Security (RLS)

- CEOs can view and manage everything
- Employees can only view/edit data in their department
- Progress and uploads are tied to the authenticated user

## 🔐 Authentication Flow

1. User logs in via `/login` (email/password)
2. Supabase validates credentials
3. Profile is fetched from `users` table
4. User is redirected based on role:
   - CEO → `/dashboard/ceo`
   - Employee → `/dashboard/employee`

## 🚢 Deployment

### Deploy to Vercel

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## 🧪 Testing the Application

1. Create at least one CEO user and one employee user
2. Log in as CEO and create some goals
3. Assign goals to employees
4. Log in as employee and submit progress
5. Switch back to CEO to see real-time updates

## 📊 Sample Goals

Here are some example goals to create:

- **Sales**: Increase monthly revenue to $50,000 (unit: $)
- **Marketing**: Generate 500 new leads (unit: leads)
- **Product**: Reduce bug count to 10 (unit: bugs)
- **Support**: Achieve 95% customer satisfaction (unit: %)

## 🤝 Support

If you encounter issues:

1. Check that your Supabase environment variables are correct
2. Ensure the SQL schema was run successfully
3. Verify users have been created in both auth.users and public.users tables
4. Check browser console for detailed error messages

## 📝 License

This project is open source and available for use.

---

**Built with ❤️ using Next.js, Supabase, and TailwindCSS**
