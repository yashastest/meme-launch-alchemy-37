
// Import from sonner for toast functionality
import { toast as sonnerToast } from "sonner";

// Types for the toast
export interface ToastProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  type?: "default" | "success" | "error" | "warning" | "info";
}

export interface ToastActionType {
  altText?: string;
  onClick: () => void;
  children: React.ReactNode;
}

// Toast interface for the hook
export interface ToastOptions extends ToastProps {
  id?: number | string;
}

// Main toast hook
export const useToast = () => {
  // Keep track of toasts
  const toasts: ToastOptions[] = [];

  return {
    toasts,
    toast: (props: ToastOptions) => {
      sonnerToast(props.title || "", {
        description: props.description,
        action: props.action,
      });
      return { id: Date.now().toString() };
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    }
  };
};

// Named exports for toast convenience functions
export const toast = {
  success: (title: string, options?: any) => 
    sonnerToast.success(`✅ ${title}`, { 
      duration: 3000,
      position: "top-center",
      ...options 
    }),

  error: (title: string, options?: any) => 
    sonnerToast.error(`❌ ${title}`, { 
      duration: 4000,
      position: "top-center",
      ...options 
    }),

  info: (title: string, options?: any) => 
    sonnerToast(`ℹ️ ${title}`, { 
      duration: 3000,
      position: "top-center",
      ...options 
    }),

  warning: (title: string, options?: any) => 
    sonnerToast.warning(`⚠️ ${title}`, { 
      duration: 4000,
      position: "top-center",
      ...options 
    }),

  // Generic method for custom toasts
  custom: (props: ToastProps) => {
    return sonnerToast(props.title || "", {
      description: props.description,
      action: props.action,
    });
  }
};
