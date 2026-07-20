import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
IconButton.displayName = "IconButton";
