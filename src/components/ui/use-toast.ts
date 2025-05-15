
// This file is kept for compatibility but will contain no actual functionality
// All imports that might use this will be handled with fallbacks

const noopFn = () => {};
const createToastFn = () => ({ id: "1", dismiss: noopFn, update: noopFn });

export const toast = {
  // Basic toast function
  ...((options?: any) => createToastFn()),
  // Common toast variants
  success: (options?: any) => createToastFn(),
  error: (options?: any) => createToastFn(),
  info: (options?: any) => createToastFn(),
  warning: (options?: any) => createToastFn(),
  dismiss: noopFn,
  update: () => createToastFn(),
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
