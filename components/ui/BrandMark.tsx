import Link from "next/link";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BrandMark({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" aria-label="Travels Pro home" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid size-10 place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#2563eb_52%,#06b6d4)] text-white shadow-[0_12px_30px_rgba(37,99,235,.3)] transition duration-500 group-hover:-rotate-6 group-hover:scale-105">
        <span className="absolute inset-px rounded-[15px] bg-white/10" />
        <Compass className="relative size-5 transition duration-500 group-hover:rotate-45" strokeWidth={2.3} />
      </span>
      <span className={cn("leading-none", inverted ? "text-white" : "text-slate-950")}>
        <span className="block text-[17px] font-black tracking-[-.04em] sm:text-[19px]">Travels Pro</span>
        <span className={cn("mt-1 block text-[8px] font-black uppercase tracking-[.23em]", inverted ? "text-cyan-200" : "text-slate-400")}>India, together</span>
      </span>
    </Link>
  );
}
