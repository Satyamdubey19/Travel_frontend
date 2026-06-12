import Link from 'next/link'

interface EmptyStateProps {
  icon?: React.ReactNode
  emoji?: string
  title: string
  description: string
  actions?: Array<{
    label: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary'
  }>
}

export default function EmptyState({ icon, emoji, title, description, actions }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl p-16 text-center shadow-lg">
      {emoji && <div className="text-6xl mb-6">{emoji}</div>}
      {icon && <div className="mb-6 flex justify-center">{icon}</div>}
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actions && actions.length > 0 && (
        <div className="flex gap-4 justify-center">
          {actions.map((action, i) => {
            const cls = action.variant === 'secondary'
              ? 'px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition'
              : 'px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition'

            if (action.href) {
              return (
                <Link key={i} href={action.href} className={cls}>
                  {action.label}
                </Link>
              )
            }
            return (
              <button key={i} onClick={action.onClick} className={cls}>
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
