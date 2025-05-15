
// This file is kept for compatibility but will contain no actual functionality
// All imports that might use this will be handled with fallbacks

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
  (options?: any) => createToast(options),
  {
    // Common toast variants as methods
    success: (options?: any) => createToast(options),
    error: (options?: any) => createToast(options),
    info: (options?: any) => createToast(options),
    warning: (options?: any) => createToast(options),
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
