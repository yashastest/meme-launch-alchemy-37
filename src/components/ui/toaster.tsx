
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastProps as RadixToastProps
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  // Map toast types to variants
  const mapToastTypeToVariant = (type?: string): "default" | "destructive" => {
    if (type === "destructive" || type === "error") return "destructive"
    return "default"
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, type, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props as RadixToastProps}
            variant={mapToastTypeToVariant(type)}
            className={
              type === "success" ? "bg-green-600" :
              type === "warning" ? "bg-yellow-600" :
              type === "info" ? "bg-blue-600" :
              undefined
            }
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
