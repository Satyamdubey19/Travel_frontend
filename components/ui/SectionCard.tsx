import type { SectionCardProps } from "@/types/ui"

export default function SectionCard({ title, description, children, className }: SectionCardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 mb-6 ${className || ''}`}>
      <div className="mb-5">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  )
}
