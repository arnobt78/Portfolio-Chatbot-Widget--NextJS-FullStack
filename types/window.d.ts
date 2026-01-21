/**
 * Type definitions for window global properties
 */

declare global {
  interface Window {
    CHATBOT_BASE_URL?: string;
    CHATBOT_TITLE?: string;
    CHATBOT_GREETING?: string;
    CHATBOT_PLACEHOLDER?: string;
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export {};
