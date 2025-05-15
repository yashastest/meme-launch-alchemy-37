
// No-op implementation to avoid crashes
// This maintains the structure but doesn't actually do anything

import * as React from "react"
import { toast as sonnerToast, type ExternalToast } from "sonner";

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
  return { 
    id: "1", 
    dismiss: noopFn, 
    update: noopFn 
  };
};

// Helper to convert our options to Sonner's format
const convertToSonnerOptions = (options?: ToastOptions | string): {message: string, options?: ExternalToast} => {
  if (typeof options === 'string') {
    return { message: options };
  } else if (options) {
    return { 
      message: options.title || '',
      options: {
        description: options.description,
        duration: options.duration
      } 
    };
  }
  return { message: '' };
};

// Create the toast object with all required methods
const toast = Object.assign(
  // Base toast function
  (options?: ToastOptions | string) => {
    const { message, options: toastOptions } = convertToSonnerOptions(options);
    sonnerToast(message, toastOptions);
    return createToastFn(options);
  },
  {
    // Methods
    success: (options?: ToastOptions | string) => {
      const { message, options: toastOptions } = convertToSonnerOptions(options);
      sonnerToast.success(message, toastOptions);
      return createToastFn(options);
    },
    error: (options?: ToastOptions | string) => {
      const { message, options: toastOptions } = convertToSonnerOptions(options);
      sonnerToast.error(message, toastOptions);
      return createToastFn(options);
    },
    warning: (options?: ToastOptions | string) => {
      const { message, options: toastOptions } = convertToSonnerOptions(options);
      sonnerToast.warning(message, toastOptions);
      return createToastFn(options);
    },
    info: (options?: ToastOptions | string) => {
      const { message, options: toastOptions } = convertToSonnerOptions(options);
      sonnerToast.info(message, toastOptions);
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
