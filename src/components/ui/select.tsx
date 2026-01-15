import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-xl border border-subtle bg-gradient-card px-4 py-3 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:border-premium disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-card hover:shadow-interactive focus:shadow-interactive",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = "Select"

const SelectTrigger = Select
const SelectValue = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, ...props }, ref) => (
  <option ref={ref} {...props} />
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.Fragment
const SelectItem = SelectValue

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }