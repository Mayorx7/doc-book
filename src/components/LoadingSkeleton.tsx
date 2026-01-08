import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function LoadingSkeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      {...props}
    />
  );
}

export { LoadingSkeleton };
