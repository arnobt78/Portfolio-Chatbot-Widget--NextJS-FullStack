/**
 * Type definitions for the chatbot widget
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface WidgetConfig {
  baseUrl: string;
  title: string;
  greeting: string;
  placeholder: string;
}

export interface FeedbackData {
  rating?: number;
  comment?: string;
  email?: string;
  type: "feedback" | "issue";
}

export type FontSize = "small" | "medium" | "large";
export type WidgetPosition = "bottom-right" | "bottom-left";
export type Theme = "dark" | "light";
