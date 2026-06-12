import Link from 'next/link'

interface BackLinkProps {
  href: string
  label: string
  className?: string
}

export default function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={`hover:underline mb-6 inline-block ${className || 'text-purple-600'}`}
    >
      ← {label}
    </Link>
  )
}
