
// No-op implementation to avoid crashes
// This maintains the structure but doesn't actually do anything

import * as React from "react"
import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  id: string
  title?: string
  description?: React.ReactNode
  action?: any
  type?: ToastType
}

export type ToastType = "default" | "destructive" | "success" | "warning" | "info" | "error"

export type ToastOptions = {
  type?: ToastType
  title?: string
  description?: React.ReactNode
  action?: any
  duration?: number
}

export type ToastActionType = {
  altText?: string
  onClick?: () => void
  children?: React.ReactNode
}

// Create a simple no-op function for all methods
const noopFn = () => {};

// Create a toast object with consistent return value
const createToastFn = (options?: any) => { 
  if (options) {
    const title = typeof options === 'string' ? options : options.title || '';
    const description = typeof options === 'string' ? '' : options.description || '';
    sonnerToast(title, description);
  }
  return { 
    id: "1", 
    dismiss: noopFn, 
    update: noopFn 
  };
};

// Create the toast object with all required methods
const toast = Object.assign(
  // Base toast function
  (options?: ToastOptions | string) => createToastFn(options),
  {
    // Methods
    success: (options?: ToastOptions | string) => {
      const title = typeof options === 'string' ? options : options?.title || '';
      const description = typeof options === 'string' ? '' : options?.description || '';
      sonnerToast.success(title, description);
      return createToastFn(options);
    },
    error: (options?: ToastOptions | string) => {
      const title = typeof options === 'string' ? options : options?.title || '';
      const description = typeof options === 'string' ? '' : options?.description || '';
      sonnerToast.error(title, description);
      return createToastFn(options);
    },
    warning: (options?: ToastOptions | string) => {
      const title = typeof options === 'string' ? options : options?.title || '';
      const description = typeof options === 'string' ? '' : options?.description || '';
      sonnerToast.warning(title, description);
      return createToastFn(options);
    },
    info: (options?: ToastOptions | string) => {
      const title = typeof options === 'string' ? options : options?.title || '';
      const description = typeof options === 'string' ? '' : options?.description || '';
      sonnerToast.info(title, description);
      return createToastFn(options);
    },
    dismiss: noopFn,
    update: (id: string, options?: ToastOptions | string) => createToastFn(options)
  }
);

function useToast() {
  // Return a mock state that won't cause rendering issues
  return {
    toasts: [],
    toast,
    dismiss: noopFn,
  }
}

export { toast, useToast }
