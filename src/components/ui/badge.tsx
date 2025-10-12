import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border-2 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20",
        secondary:
          "border-gray-400 bg-gray-50 text-gray-700 hover:bg-gray-100",
        destructive:
          "border-red-400 bg-red-50 text-red-700 hover:bg-red-100",
        outline: "border-gray-300 text-foreground hover:bg-gray-50",
        success:
          "border-green-400 bg-green-50 text-green-700 hover:bg-green-100",
        warning:
          "border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
        info:
          "border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
