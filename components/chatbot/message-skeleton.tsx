"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { FontSize } from "@/lib/types";
import { FONT_SIZES } from "@/lib/constants";

/**
 * Skeleton loader for chat messages
 * Matches exact dimensions of message bubbles to prevent flickering
 */
export function MessageSkeleton({
  role,
  fontSize = "medium",
}: {
  role: "user" | "assistant";
  fontSize?: FontSize;
}) {
  const fontSizeClasses = FONT_SIZES[fontSize];

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-black rounded-2xl rounded-br-md px-4 py-3 max-w-[85%] border border-gray-200 dark:border-gray-600">
          <Skeleton
            className={cn("h-4 w-32 bg-gray-700 dark:bg-gray-600", fontSizeClasses.message)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700" />
          <Skeleton className="h-4 w-24 bg-gray-300 dark:bg-gray-700" />
        </div>
        <div className="space-y-2">
          <Skeleton
            className={cn("h-4 w-full bg-gray-300 dark:bg-gray-700", fontSizeClasses.message)}
          />
          <Skeleton
            className={cn("h-4 w-3/4 bg-gray-300 dark:bg-gray-700", fontSizeClasses.message)}
          />
          <Skeleton
            className={cn("h-4 w-1/2 bg-gray-300 dark:bg-gray-700", fontSizeClasses.message)}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for loading initial chat history
 * Shows 3 message skeletons (2 assistant, 1 user)
 */
export function ChatHistorySkeleton({ fontSize = "medium" }: { fontSize?: FontSize }) {
  return (
    <div className="space-y-4">
      <MessageSkeleton role="assistant" fontSize={fontSize} />
      <MessageSkeleton role="user" fontSize={fontSize} />
      <MessageSkeleton role="assistant" fontSize={fontSize} />
    </div>
  );
}
