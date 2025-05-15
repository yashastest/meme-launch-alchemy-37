
import { toast as sonnerToast } from "sonner";
import * as React from "react";

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
  // Create a state array for toasts
  const [toasts, setToasts] = React.useState<ToastOptions[]>([]);

  const toast = (props: ToastOptions) => {
    const id = props.id || Date.now().toString();
    setToasts((prevToasts) => [...prevToasts, { ...props, id }]);
    
    sonnerToast(props.title || "", {
      description: props.description,
      action: props.action,
    });
    
    return { id };
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== toastId));
      sonnerToast.dismiss(toastId);
    } else {
      setToasts([]);
      sonnerToast.dismiss();
    }
  };

  return {
    toasts,
    toast,
    dismiss
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
