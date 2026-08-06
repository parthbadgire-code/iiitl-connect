import * as React from "react"
import { cn } from "../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-neutral-800 bg-[#050505] px-3 py-2 text-sm text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-600 focus-visible:outline-none focus-visible:border-pastel-blue/50 focus-visible:ring-1 focus-visible:ring-pastel-blue/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
