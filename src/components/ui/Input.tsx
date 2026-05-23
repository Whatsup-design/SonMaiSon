import React from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, label, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50",
            hasError && "border-red-400 focus:border-red-400 focus:ring-red-100",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = 'Input'

