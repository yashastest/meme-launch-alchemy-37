
import { toast as sonnerToast } from "sonner";

// Configure the toast with custom properties for curved UI
const wybeToast = {
  success: (title: string, options?: any) => 
    sonnerToast.success(`✅ ${title}`, { 
      className: "rounded-xl border border-green-500/20 shadow-curved",
      ...options 
    }),
  error: (title: string, options?: any) => 
    sonnerToast.error(`❌ ${title}`, { 
      className: "rounded-xl border border-red-500/20 shadow-curved",
      ...options 
    }),
  info: (title: string, options?: any) => 
    sonnerToast.info(`ℹ️ ${title}`, { 
      className: "rounded-xl border border-blue-500/20 shadow-curved",
      ...options 
    }),
  warning: (title: string, options?: any) => 
    sonnerToast.warning(`⚠️ ${title}`, { 
      className: "rounded-xl border border-yellow-500/20 shadow-curved",
      ...options 
    }),
};

// Export the wybeToast as a named export (not as default)
export { wybeToast };
