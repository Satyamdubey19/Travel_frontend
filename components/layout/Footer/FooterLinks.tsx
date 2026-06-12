import type { FooterLinksProps } from "@/types/layout"

export default function FooterLinks({ links }: FooterLinksProps) {
  return (
    <ul className="grid gap-2 text-sm">
      {links.map((link) => (
        <li key={link.label}>
          <a href={link.href} className="font-bold transition hover:underline block" style={{color: '#FFFFFF'}}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
