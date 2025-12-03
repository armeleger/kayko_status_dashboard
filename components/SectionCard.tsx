interface SectionCardProps {
  title: string
  description?: string
  icon?: string
  children: React.ReactNode
}

export default function SectionCard({
  title,
  description,
  icon,
  children,
}: SectionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-6">
        {icon && <span className="text-3xl">{icon}</span>}
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}
