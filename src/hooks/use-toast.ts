
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

const noopFn = () => {};

// Create a simple toast object with no functionality
const toast = {
  // Basic method that returns an object with expected shape but does nothing
  id: "1",
  dismiss: noopFn,
  update: noopFn
};

// Add common toast types as no-op functions
toast.success = () => ({ id: "1", dismiss: noopFn, update: noopFn });
toast.error = () => ({ id: "1", dismiss: noopFn, update: noopFn });
toast.warning = () => ({ id: "1", dismiss: noopFn, update: noopFn });
toast.info = () => ({ id: "1", dismiss: noopFn, update: noopFn });

function useToast() {
  // Return a mock state that won't cause rendering issues
  return {
    toasts: [],
    toast,
    dismiss: noopFn,
  }
}

export { toast, useToast }
