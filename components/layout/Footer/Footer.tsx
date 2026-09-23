import Link from "next/link";
import { ArrowUpRight, BadgeCheck, HeartHandshake, MapPin, ShieldCheck } from "lucide-react";
import BrandMark from "@/components/ui/BrandMark";

const groups = [
  { title: "Discover", links: [{ label: "Hosted tours", href: "/tours" }, { label: "Local activities", href: "/activities" }, { label: "Cars & bikes", href: "/car-rental" }, { label: "Travel stories", href: "/posts" }] },
  { title: "Your journey", links: [{ label: "My bookings", href: "/my-bookings" }, { label: "Wishlist", href: "/wishlist" }, { label: "Profile", href: "/profile" }, { label: "Get support", href: "/terms" }] },
  { title: "Host locally", links: [{ label: "Become a host", href: "/host/signup" }, { label: "Sign in to host", href: "/login?intent=host" }, { label: "Host dashboard", href: "/host" }, { label: "Manage tours", href: "/host/tours" }] },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(124,58,237,.22),transparent_30%),radial-gradient(circle_at_90%_75%,rgba(6,182,212,.16),transparent_28%)]" />
      <div className="travel-grid absolute inset-0 opacity-15" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <BrandMark inverted />
            <p className="mt-6 max-w-md text-lg font-bold leading-8 text-slate-200">Explore more. Meet real people.<br />Travel with confidence.</p>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">India-first small-group trips, local activities and flexible rentals with clearer trust signals and private trip communities.</p>
            <div className="mt-7 flex flex-wrap gap-2">{[{ icon: BadgeCheck, label: "Specific verification" }, { icon: ShieldCheck, label: "Risk shown early" }, { icon: HeartHandshake, label: "People-first travel" }].map(({ icon: Icon, label }) => <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-2 text-[11px] font-black text-slate-300"><Icon className="size-3.5 text-cyan-300" />{label}</span>)}</div>
          </div>
          <div className="grid gap-9 sm:grid-cols-3">{groups.map((group) => <div key={group.title}><h2 className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">{group.title}</h2><ul className="mt-5 space-y-3">{group.links.map((link) => <li key={link.href}><Link href={link.href} className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-300 transition hover:text-white">{link.label}<ArrowUpRight className="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" /></Link></li>)}</ul></div>)}</div>
        </div>
        <div className="flex flex-col gap-5 pt-7 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Travels Pro. Built for responsible local travel in India.</p><div className="flex flex-wrap items-center gap-5"><Link href="/terms" className="transition hover:text-white">Terms & privacy</Link><span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />India</span></div></div>
      </div>
    </footer>
  );
}
