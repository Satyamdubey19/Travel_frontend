type UserMenuProps = {
  label: string
}

export default function UserMenu({ label }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 shadow-sm">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm">G</span>
      <div className="hidden sm:block">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-slate-500">Welcome!</p>
      </div>
    </div>
  )
}
