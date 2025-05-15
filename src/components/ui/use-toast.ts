
// This file is kept for compatibility with components expecting shadcn/ui toast functionality
// It delegates to the sonner toast

import { toast as sonnerToast } from "sonner";

const noopFn = () => {};

// Create a function that returns an object with the expected shape
const createToast = (options?: any) => ({
  id: "1", 
  dismiss: noopFn, 
  update: noopFn
});

// Create the toast object with all required methods
export const toast = Object.assign(
  // Base toast function
  (options?: any) => {
    sonnerToast(options?.title || options || "", options?.description || "");
    return createToast(options);
  },
  {
    // Common toast variants as methods
    success: (options?: any) => {
      sonnerToast.success(options?.title || options || "", options?.description || "");
      return createToast(options);
    },
    error: (options?: any) => {
      sonnerToast.error(options?.title || options || "", options?.description || "");
      return createToast(options);
    },
    info: (options?: any) => {
      sonnerToast.info(options?.title || options || "", options?.description || "");
      return createToast(options);
    },
    warning: (options?: any) => {
      sonnerToast.warning(options?.title || options || "", options?.description || "");
      return createToast(options);
    },
    
    // Additional methods
    dismiss: noopFn,
    update: (id: string, options?: any) => createToast(options)
  }
);

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
