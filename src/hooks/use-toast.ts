
import * as React from "react";
import { EventEmitter } from "eventemitter3";

// Toast types
export type ToastActionType = {
  altText?: string;
  onClick: () => void;
  render: React.ReactNode;
};

export type ToastProps = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode; // Changed from ToastActionType to ReactNode
  type?: "default" | "success" | "warning" | "destructive" | "error" | "info";
  duration?: number;
};

export type ToastOptions = Omit<ToastProps, "id">;

// Create a toast emitter
const toastEmitter = new EventEmitter();
const TOAST_ADD_EVENT = "toast-add";
const TOAST_REMOVE_EVENT = "toast-remove";
const TOAST_DISMISS_EVENT = "toast-dismiss";

let toastCount = 0;

function generateToastId() {
  return `toast-${toastCount++}`;
}

export function toast(options: ToastOptions | string) {
  const id = generateToastId();
  
  // If options is a string, treat it as a description
  const toastOptions: ToastProps = typeof options === "string"
    ? { description: options, id }
    : { ...options, id };
  
  toastEmitter.emit(TOAST_ADD_EVENT, toastOptions);
  
  return {
    id,
    dismiss: () => toastEmitter.emit(TOAST_DISMISS_EVENT, id),
    update: (options: ToastOptions) => {
      toastEmitter.emit(TOAST_ADD_EVENT, { ...options, id });
    },
  };
}

// Attach convenience methods for common toast types
toast.success = (options: ToastOptions | string) => {
  const toastOptions = typeof options === "string" ? { description: options } : options;
  return toast({ ...toastOptions, type: "success" });
};

toast.warning = (options: ToastOptions | string) => {
  const toastOptions = typeof options === "string" ? { description: options } : options;
  return toast({ ...toastOptions, type: "warning" });
};

toast.error = (options: ToastOptions | string) => {
  const toastOptions = typeof options === "string" ? { description: options } : options;
  return toast({ ...toastOptions, type: "error" });
};

toast.info = (options: ToastOptions | string) => {
  const toastOptions = typeof options === "string" ? { description: options } : options;
  return toast({ ...toastOptions, type: "info" });
};

// Dismiss one or all toasts
toast.dismiss = (id?: string) => {
  toastEmitter.emit(TOAST_DISMISS_EVENT, id);
};

// React hook to access and control toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);
  
  React.useEffect(() => {
    // Add toast
    const handleAddToast = (toast: ToastProps) => {
      setToasts(prev => {
        // Update existing toast with same id if it exists
        const existing = prev.find(t => t.id === toast.id);
        if (existing) {
          return prev.map(t => t.id === toast.id ? { ...t, ...toast } : t);
        }
        return [...prev, toast];
      });
      
      // Auto-dismiss after duration
      if (toast.duration !== Infinity) {
        setTimeout(() => {
          toastEmitter.emit(TOAST_REMOVE_EVENT, toast.id);
        }, toast.duration || 5000);
      }
    };
    
    // Remove toast
    const handleRemoveToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
    };
    
    // Dismiss toast (animate then remove)
    const handleDismissToast = (id?: string) => {
      if (id) {
        toastEmitter.emit(TOAST_REMOVE_EVENT, id);
      } else {
        setToasts(prev => {
          prev.forEach(toast => {
            toastEmitter.emit(TOAST_REMOVE_EVENT, toast.id);
          });
          return [];
        });
      }
    };
    
    toastEmitter.on(TOAST_ADD_EVENT, handleAddToast);
    toastEmitter.on(TOAST_REMOVE_EVENT, handleRemoveToast);
    toastEmitter.on(TOAST_DISMISS_EVENT, handleDismissToast);
    
    return () => {
      toastEmitter.off(TOAST_ADD_EVENT, handleAddToast);
      toastEmitter.off(TOAST_REMOVE_EVENT, handleRemoveToast);
      toastEmitter.off(TOAST_DISMISS_EVENT, handleDismissToast);
    };
  }, []);
  
  return {
    toasts,
    toast,
    dismiss: toast.dismiss,
  };
}
