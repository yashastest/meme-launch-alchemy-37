
// This file is kept for compatibility with components expecting shadcn/ui toast functionality
// It delegates to the sonner toast

import { toast as sonnerToast, type ExternalToast } from "sonner";

const noopFn = () => {};

// Create a function that returns an object with the expected shape
const createToast = (options?: any) => ({
  id: "1", 
  dismiss: noopFn, 
  update: noopFn
});

// Helper to convert our options to Sonner's format
const convertToSonnerOptions = (options?: any): {message: string, options?: ExternalToast} => {
  if (typeof options === 'string') {
    return { message: options };
  } else if (options) {
    return { 
      message: options.title || '',
      options: {
        description: options.description
      } 
    };
  }
  return { message: '' };
};

// Create the toast object with all required methods
export const toast = Object.assign(
  // Base toast function
  (options?: any) => {
    const { message, options: toastOptions } = convertToSonnerOptions(options);
    sonnerToast(message, toastOptions);
    return createToast(options);
  },
  {
    // Common toast variants as methods
    success: (options?: any) => {
      const { message, options: toastOptions } = convertToSonnerOptions(options);
      sonnerToast.success(message, toastOptions);
      return createToast(options);
    },
    error: (options?: any) => {
      const { message, options: toastOptions } = convertToSonnerOptions(options);
      sonnerToast.error(message, toastOptions);
      return createToast(options);
    },
    info: (options?: any) => {
      const { message, options: toastOptions } = convertToSonnerOptions(options);
      sonnerToast.info(message, toastOptions);
      return createToast(options);
    },
    warning: (options?: any) => {
      const { message, options: toastOptions } = convertToSonnerOptions(options);
      sonnerToast.warning(message, toastOptions);
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
