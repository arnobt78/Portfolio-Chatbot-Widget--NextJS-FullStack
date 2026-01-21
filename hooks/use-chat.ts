import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { toast } from "@/components/ui/toast";

const CHATBOT_BASE_URL =
  typeof window !== "undefined"
    ? window.CHATBOT_BASE_URL || window.location.origin
    : "";

/**
 * Fetch chat history from API
 */
async function fetchHistory(): Promise<ChatMessage[]> {
  const response = await fetch(`${CHATBOT_BASE_URL}/api/history`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch chat history");
  }
  const data = await response.json();
  return data.messages || [];
}

/**
 * Send a message to the chat API and stream the response
 */
async function sendMessage(
  message: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch(`${CHATBOT_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    credentials: "include",
  });

  if (!response.ok || !response.body) {
    throw new Error("Failed to send message");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunks = decoder.decode(value, { stream: true });
    const lines = chunks.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;

      try {
        const parsed = JSON.parse(data);
        if (parsed.response) {
          fullResponse += parsed.response;
          onChunk(parsed.response);
        }
        if (parsed.error) {
          throw new Error(parsed.error);
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  return fullResponse;
}

/**
 * React hook for managing chat functionality
 * Provides chat history, sending messages, and real-time updates
 */
export function useChat() {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");

  // Query for chat history
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chat-history"],
    queryFn: fetchHistory,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
    retry: 1, // Retry once on failure
    refetchOnMount: true, // Fetch on mount
  });

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      setIsStreaming(true);
      setStreamingMessage("");
      
      // Create user message with unique timestamp for stable key
      const timestamp = Date.now();
      const userMessage: ChatMessage = {
        role: "user",
        content: message,
        timestamp,
      };

      // Optimistic update: add user message immediately for instant UI feedback
      queryClient.setQueryData<ChatMessage[]>(["chat-history"], (old) => {
        const existing = old || [];
        // Avoid duplicates by checking last message
        const lastMsg = existing[existing.length - 1];
        if (lastMsg?.role === "user" && lastMsg?.content === message) {
          return existing; // Already added
        }
        return [...existing, userMessage];
      });

      let fullResponse = "";

      try {
        fullResponse = await sendMessage(message, (chunk) => {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        });

        // Add assistant response to cache
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: fullResponse,
          timestamp: timestamp + 1, // Use timestamp from user message + 1 for ordering
        };

        // Update cache with final assistant message (user message already added optimistically)
        queryClient.setQueryData<ChatMessage[]>(["chat-history"], (old) => {
          if (!old) return [userMessage, assistantMessage];
          
          // Find user message index (should be last message)
          const userMsgIndex = old.findIndex(
            (msg) => msg.role === "user" && msg.timestamp === timestamp
          );
          
          if (userMsgIndex >= 0) {
            // Remove any partial assistant messages that might exist and add final one
            const updated = old.slice(0, userMsgIndex + 1); // Keep everything up to and including user message
            // Remove any assistant messages that might have been added during streaming
            return [...updated, assistantMessage];
          }
          
          // Fallback: user message not found, add both
          return [...old, userMessage, assistantMessage];
        });

        return assistantMessage;
      } catch (error) {
        // Remove user message on error
        queryClient.setQueryData<ChatMessage[]>(["chat-history"], (old) => {
          if (!old) return old;
          return old.filter((msg) => msg.timestamp !== userMessage.timestamp);
        });
        throw error;
      } finally {
        setIsStreaming(false);
        setStreamingMessage("");
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to send message", error.message);
      setIsStreaming(false);
      setStreamingMessage("");
    },
  });

  // Clear chat history
  const clearChat = useCallback(() => {
    queryClient.setQueryData<ChatMessage[]>(["chat-history"], []);
    toast.info("Chat cleared");
  }, [queryClient]);

  // Add message manually (for optimistic updates)
  const addMessage = useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(["chat-history"], (old) => {
        const existing = old || [];
        return [...existing, message];
      });
    },
    [queryClient]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending || isStreaming,
    streamingMessage,
    clearChat,
    addMessage,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["chat-history"] }),
  };
}
