/**
 * Application constants
 */

export const STORAGE_KEYS = {
  THEME: "chatbot-theme",
  FONT_SIZE: "chatbot-font-size",
  WIDGET_POSITION: "chatbot-position",
  RATING_SUBMITTED: "chatbot-rating-submitted",
} as const;

export const FONT_SIZES = {
  small: { base: "text-xs", message: "text-xs" },
  medium: { base: "text-sm", message: "text-sm" },
  large: { base: "text-base", message: "text-base" },
} as const;

export const WIDGET_POSITIONS = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
} as const;
