import * as React from "react"
import { AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InputFieldProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
  containerClassName?: string
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      clearable,
      onClear,
      containerClassName,
      className,
      id,
      value,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const hasValue = value !== undefined && value !== "" && value !== null

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            <span>{label}</span>
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
        )}

        <div
          className={cn(
            "group relative flex items-center rounded-xl border bg-white shadow-sm transition-all duration-200",
            "border-slate-200 focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/15",
            error && "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/15 bg-rose-50/20",
            disabled && "bg-slate-50 opacity-60 cursor-not-allowed"
          )}
        >
          {leftIcon && (
            <div className="flex size-10 shrink-0 items-center justify-center text-slate-400 group-focus-within:text-cyan-600 transition-colors">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            value={value}
            disabled={disabled}
            className={cn(
              "h-11 w-full min-w-0 bg-transparent px-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none disabled:cursor-not-allowed",
              leftIcon && "pl-0",
              (rightIcon || (clearable && hasValue)) && "pr-0",
              className
            )}
            {...props}
          />

          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="mr-2 flex size-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Clear input"
            >
              <X className="size-3.5" />
            </button>
          )}

          {rightIcon && !error && (
            <div className="flex size-10 shrink-0 items-center justify-center text-slate-400 group-focus-within:text-slate-700">
              {rightIcon}
            </div>
          )}

          {error && (
            <div className="flex size-10 shrink-0 items-center justify-center text-rose-500">
              <AlertCircle className="size-4" />
            </div>
          )}
        </div>

        {error ? (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

InputField.displayName = "InputField"

export { InputField }
export default InputField

