import React from 'react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] hover:-translate-y-[1px]"
    
    const variants = {
      primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08)]",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
      outline: "border border-slate-200 bg-transparent text-slate-900 hover:bg-slate-50",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:-translate-y-0 shadow-none active:scale-100"
    }

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg"
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
