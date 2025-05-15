
"use client"

import * as React from "react"
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import { cn } from "@/lib/utils"

// Enhanced AspectRatio with additional props for curved corners
const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> & {
    curved?: boolean;
    curvedSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  }
>(({ className, curved = false, curvedSize = "lg", ...props }, ref) => {
  const curvedClasses = curved 
    ? `overflow-hidden ${curvedSize === "sm" ? "rounded-sm" :
                       curvedSize === "md" ? "rounded-md" :
                       curvedSize === "lg" ? "rounded-lg" :
                       curvedSize === "xl" ? "rounded-xl" :
                       curvedSize === "2xl" ? "rounded-2xl" :
                       curvedSize === "3xl" ? "rounded-3xl" :
                       curvedSize === "full" ? "rounded-full" : "rounded-lg"}` 
    : "";
    
  return (
    <AspectRatioPrimitive.Root
      ref={ref}
      className={cn(curvedClasses, className)}
      {...props}
    />
  );
});

AspectRatio.displayName = "AspectRatio";

export { AspectRatio }
