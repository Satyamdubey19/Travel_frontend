import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function SectionHeading({ eyebrow, title, description, action, align = "left", className }: { eyebrow: string; title: string; description?: string; action?: ReactNode; align?: "left" | "center"; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between", align === "center" && "mx-auto max-w-3xl text-center sm:block", className)}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.26em] text-cyan-800">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em] text-slate-950 sm:text-4xl lg:text-5xl">{title}</h2>
        {description && <p className={cn("mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base", align === "center" && "mx-auto")}>{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
