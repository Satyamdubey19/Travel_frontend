import type { ComponentType } from "react"

type FeatureCardProps = {
  icon: ComponentType<{ className?: string }>
  title: string
  text: string
}

export default function FeatureCard({ icon: Icon, title, text }: FeatureCardProps) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm">
      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#5EEAD4]/70 text-[#0F766E]">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-sm font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-[230px] text-xs leading-5 text-slate-500">{text}</p>
    </div>
  )
}
