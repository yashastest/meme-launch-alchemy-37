
import React from "react"
import { cn } from "@/lib/utils"

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"; // Use specific types
  className?: string;
  gradient?: "orange" | "blue" | "green" | "purple" | "gray";
}

export function Shimmer({
  width = "100%",
  height = "1rem",
  rounded = "md",
  className,
  gradient = "orange",
  ...props
}: ShimmerProps) {
  const gradientClasses = {
    orange: "from-orange-700/20 via-orange-500/30 to-orange-700/20",
    blue: "from-blue-700/20 via-blue-500/30 to-blue-700/20",
    green: "from-green-700/20 via-green-500/30 to-green-700/20",
    purple: "from-purple-700/20 via-purple-500/30 to-purple-700/20",
    gray: "from-gray-700/20 via-gray-500/30 to-gray-700/20",
  };
  
  return (
    <div
      className={cn(
        `animate-pulse bg-gradient-to-r ${gradientClasses[gradient]} rounded-${rounded}`,
        className
      )}
      style={{ width, height }}
      {...props}
    />
  )
}
