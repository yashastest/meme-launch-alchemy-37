
import React from "react";
import { toast as sonnerToast } from "sonner";

// Define the types
export interface ToastProps {
  id: number | string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  type?: "default" | "success" | "error" | "warning" | "info" | "destructive";
}

export interface ToastOptions {
  duration?: number;
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";
  onDismiss?: () => void;
}

export type ToastActionType = typeof toast;

// The main toast function with various convenience methods
const toast = Object.assign(
  (props: ToastProps & ToastOptions) => {
    const { title, description, type, ...options } = props;
    
    return sonnerToast(title, {
      description,
      ...options,
    });
  },
  {
    success: (message: string, options?: ToastOptions) => 
      sonnerToast.success(message, options),
    
    error: (message: string, options?: ToastOptions) => 
      sonnerToast.error(message, options),
    
    warning: (message: string, options?: ToastOptions) => 
      sonnerToast(message, { ...options, type: "warning" }),
    
    info: (message: string, options?: ToastOptions) => 
      sonnerToast(message, { ...options, type: "info" }),
    
    destructive: (message: string, options?: ToastOptions) => 
      sonnerToast(message, { ...options, type: "destructive" }),
  }
);

export { toast };

// Create a hook for accessing toasts in components
export const useToast = () => {
  const toasts: ToastProps[] = []; // This would normally be populated from state
  
  return {
    toast,
    toasts,
    dismiss: sonnerToast.dismiss,
    clear: sonnerToast.dismiss,
  };
};
