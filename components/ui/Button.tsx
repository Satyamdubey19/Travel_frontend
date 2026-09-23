import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-slate-950 text-white shadow-md shadow-slate-950/15 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-950/25 active:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100",
        brand:
          "overflow-hidden bg-[linear-gradient(110deg,#0f172a_0%,#172554_50%,#0e7490_100%)] text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] before:absolute before:inset-y-0 before:-left-1/3 before:w-1/4 before:-skew-x-12 before:bg-white/25 before:blur-sm before:transition-all before:duration-700 hover:before:left-[115%] hover:shadow-[0_16px_38px_rgba(14,116,144,0.3)]",
        glow:
          "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:shadow-[0_0_32px_rgba(6,182,212,0.6)] hover:brightness-110",
        outline:
          "border-slate-200 bg-white/80 text-slate-800 shadow-sm backdrop-blur-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800",
        secondary:
          "bg-slate-100 text-slate-900 hover:bg-slate-200/80 active:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white",
        destructive:
          "bg-rose-50 border border-rose-200/60 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm hover:shadow-rose-500/20 active:bg-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white",
        glass:
          "border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-xl hover:bg-white/25 hover:border-white/30",
        link: "text-cyan-600 underline-offset-4 hover:underline hover:text-cyan-700 dark:text-cyan-400 p-0 h-auto font-medium hover:translate-y-0 active:scale-100",
      },
      size: {
        default: "h-10 gap-2 px-4 text-sm",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8.5 gap-1.5 rounded-lg px-3 text-xs font-semibold [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11.5 gap-2.5 rounded-xl px-6 text-base font-semibold",
        xl: "h-13 gap-3 rounded-2xl px-7 text-base font-bold",
        icon: "size-10 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8.5 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-12 rounded-2xl [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot.Root
          ref={ref}
          data-slot="button"
          data-variant={variant}
          data-size={size}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        >
          {children}
        </Slot.Root>
      )
    }

    return (
      <button
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
export default Button
