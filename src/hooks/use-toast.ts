
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  type?: "default" | "success" | "error" | "warning" | "info";
};

export const useToast = () => {
  const toast = (props: ToastProps) => {
    const { title, description, action, ...rest } = props;
    return sonnerToast(title || "", { description, action, ...rest });
  };

  toast.success = (title: string, options?: any) => 
    sonnerToast.success(`✅ ${title}`, { 
      className: "rounded-xl border border-green-500/20 shadow-curved",
      ...options 
    });
  
  toast.error = (title: string, options?: any) => 
    sonnerToast.error(`❌ ${title}`, { 
      className: "rounded-xl border border-red-500/20 shadow-curved",
      ...options 
    });
  
  toast.info = (title: string, options?: any) => 
    sonnerToast.info(`ℹ️ ${title}`, { 
      className: "rounded-xl border border-blue-500/20 shadow-curved",
      ...options 
    });
  
  toast.warning = (title: string, options?: any) => 
    sonnerToast.warning(`⚠️ ${title}`, { 
      className: "rounded-xl border border-yellow-500/20 shadow-curved",
      ...options 
    });

  return {
    toast,
    toasts: [] as any[],
    dismiss: sonnerToast.dismiss,
    // For compatibility with radix toast
    update: () => {},
  };
};

// Direct export for convenience
export { sonnerToast as toast };
