import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px]"

    const variantClasses = {
      default: "bg-primary text-background border border-primary hover:opacity-90",
      destructive: "bg-danger text-white border border-danger hover:opacity-90",
      outline: "border border-border bg-card text-foreground hover:border-primary/30",
      secondary: "bg-primary/5 text-foreground border border-border hover:bg-primary/10",
      ghost: "text-secondary hover:text-foreground hover:bg-primary/5 border border-transparent",
      link: "text-accent underline-offset-4 hover:underline p-0 h-auto",
    }

    const sizeClasses = {
      default: "h-11 px-5",
      sm: "h-9 px-3.5 text-[13px]",
      lg: "h-12 px-6 text-[15px]",
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
