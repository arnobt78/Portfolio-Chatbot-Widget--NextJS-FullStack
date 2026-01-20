import * as React from "react";
import { toast as sonnerToast } from "sonner";

/**
 * Toast notification wrapper using Sonner
 * Provides consistent toast notifications across the app
 */
export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },
};

export { Toaster } from "sonner";
