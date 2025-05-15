
import * as React from "react";
import { toast as sonnerToast } from "sonner";

// Types for the toast
export interface ToastProps {
  id?: string | number;
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
export interface ToastOptions extends Partial<ToastProps> {
  duration?: number;
  position?: "top-center" | "top-right" | "bottom-right" | "bottom-center";
}

// Main toast hook
export const useToast = () => {
  // Create a state array for toasts
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
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
  success: (title: string, options?: Partial<ToastOptions>) => 
    sonnerToast.success(`✅ ${title}`, { 
      duration: 3000,
      position: "top-center",
      ...(options || {})
    }),

  error: (title: string, options?: Partial<ToastOptions>) => 
    sonnerToast.error(`❌ ${title}`, { 
      duration: 4000,
      position: "top-center",
      ...(options || {})
    }),

  info: (title: string, options?: Partial<ToastOptions>) => 
    sonnerToast(`ℹ️ ${title}`, { 
      duration: 3000,
      position: "top-center",
      ...(options || {})
    }),

  warning: (title: string, options?: Partial<ToastOptions>) => 
    sonnerToast.warning(`⚠️ ${title}`, { 
      duration: 4000,
      position: "top-center",
      ...(options || {})
    }),

  // Generic method for custom toasts
  custom: (props: ToastProps) => {
    return sonnerToast(props.title || "", {
      description: props.description,
      action: props.action,
    });
  }
};
