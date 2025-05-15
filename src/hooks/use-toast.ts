
// No-op implementation to avoid crashes
// This maintains the structure but doesn't actually do anything

import * as React from "react"

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

// Basic toast function that returns standard toast object
const createToastFn = () => ({ id: "1", dismiss: () => {}, update: () => {} });

// Create the toast object with all required methods
const toast = Object.assign(
  // Base toast function
  (options?: ToastOptions | string) => createToastFn(),
  {
    // Methods
    success: (options?: ToastOptions | string) => createToastFn(),
    error: (options?: ToastOptions | string) => createToastFn(),
    warning: (options?: ToastOptions | string) => createToastFn(),
    info: (options?: ToastOptions | string) => createToastFn(),
    dismiss: () => {},
    update: (id: string, options?: ToastOptions | string) => createToastFn()
  }
);

function useToast() {
  // Return a mock state that won't cause rendering issues
  return {
    toasts: [],
    toast,
    dismiss: () => {},
  }
}

export { toast, useToast }
