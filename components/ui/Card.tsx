import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.ComponentProps<"div"> {
  size?: "default" | "sm" | "lg"
  variant?: "default" | "glass" | "interactive" | "elevated" | "flat"
}

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: CardProps) {
  const variantStyles = {
    default:
      "bg-white border border-slate-200/80 shadow-sm text-slate-900",
    glass:
      "bg-white/75 backdrop-blur-xl border border-white/70 shadow-[0_8px_32px_rgba(15,23,42,0.06)] text-slate-900",
    interactive:
      "bg-white border border-slate-200/80 shadow-sm hover:shadow-[0_20px_48px_-12px_rgba(15,23,42,0.12)] hover:border-cyan-500/30 hover:-translate-y-1 transition-all duration-300 text-slate-900 cursor-pointer",
    elevated:
      "bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] text-slate-900",
    flat: "bg-slate-50 border border-slate-200/60 text-slate-900",
  }

  const sizeStyles = {
    default: "gap-4 p-5 sm:p-6 rounded-2xl",
    sm: "gap-3 p-4 rounded-xl",
    lg: "gap-6 p-6 sm:p-8 rounded-3xl",
  }

  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/card flex flex-col overflow-hidden text-sm",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-lg font-bold tracking-tight text-slate-900 group-data-[size=sm]/card:text-base group-data-[size=lg]/card:text-xl",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-xs sm:text-sm text-slate-500 leading-relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "self-start shrink-0",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex-1", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 pt-4 border-t border-slate-100 group-data-[size=sm]/card:pt-3",
        className
      )}
      {...props}
    />
  )
}

function CardBadge({
  className,
  tone = "cyan",
  ...props
}: React.ComponentProps<"span"> & {
  tone?: "cyan" | "emerald" | "amber" | "violet" | "rose" | "slate"
}) {
  const tones = {
    cyan: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
    emerald: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    rose: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }

  return (
    <span
      data-slot="card-badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide backdrop-blur-sm",
        tones[tone],
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardBadge,
}
export default Card
