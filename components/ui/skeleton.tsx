import { cn } from "@/lib/utils";

/**
 * Skeleton loader component
 * Provides consistent loading placeholders with exact dimensions
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-800", className)}
      {...props}
    />
  );
}

export { Skeleton };
