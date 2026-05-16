import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "gold";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-dc-gold disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-dc-text text-white hover:bg-dc-text/90 shadow-sm": variant === "default",
            "bg-transparent border border-dc-border hover:bg-gray-100 dark:hover:bg-dc-border/50": variant === "outline",
            "hover:bg-gray-100 dark:hover:bg-dc-border/50": variant === "ghost",
            "bg-gradient-to-b from-[#e6c97a] to-[#d4af37] text-white hover:from-[#d4af37] hover:to-[#c5a017] shadow-lg shadow-[#d4af37]/20 border border-[#b8952d]": variant === "gold",
            "h-11 px-4 py-2 min-h-[44px] min-w-[44px]": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-12 rounded-md px-8 text-base": size === "lg",
            "h-11 w-11": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
