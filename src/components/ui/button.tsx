import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-interactive hover:shadow-interactive active:scale-[0.98]"

    const variantClasses = {
      default: "bg-gradient-primary text-white hover:shadow-premium border border-primary/20",
      destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-card",
      outline: "border border-premium bg-gradient-card hover:bg-white/80 text-primary shadow-card",
      secondary: "bg-gradient-card border border-subtle text-secondary hover:text-primary hover:border-premium shadow-card",
      ghost: "hover:bg-white/60 text-secondary hover:text-primary border border-transparent",
      link: "text-accent underline-offset-4 hover:underline shadow-none border-none bg-transparent hover:bg-transparent",
    }

    const sizeClasses = {
      default: "h-11 px-6 py-3",
      sm: "h-9 rounded-lg px-4 text-xs",
      lg: "h-13 rounded-xl px-8 text-base",
      icon: "h-11 w-11",
    }

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }