
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

// Create a simple toast function that returns a standard object
const createToastFn = () => ({ id: "1", dismiss: () => {}, update: () => {} });

// Basic toast function that returns standard toast object
const toast = (options?: ToastOptions | string) => createToastFn();

// Add common toast types that return the same object structure
toast.success = (options?: ToastOptions | string) => createToastFn();
toast.error = (options?: ToastOptions | string) => createToastFn();
toast.warning = (options?: ToastOptions | string) => createToastFn();
toast.info = (options?: ToastOptions | string) => createToastFn();
toast.dismiss = () => {};
toast.update = () => createToastFn();

function useToast() {
  // Return a mock state that won't cause rendering issues
  return {
    toasts: [],
    toast,
    dismiss: () => {},
  }
}

export { toast, useToast }
