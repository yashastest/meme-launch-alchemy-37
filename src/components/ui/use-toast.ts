
// This file is kept for compatibility but will contain no actual functionality
// All imports that might use this will be handled with fallbacks

const noopFn = () => {};

export const toast = {
  // Basic method that does nothing
  noopFn,
  // Common toast variants as no-op functions
  error: noopFn,
  success: noopFn, 
  info: noopFn,
  warning: noopFn,
};

export const useToast = () => {
  return {
    toasts: [],
    toast,
    dismiss: noopFn,
  };
};

export type ToastProps = any;
export type ToastOptions = any;
export type ToastActionType = any;
