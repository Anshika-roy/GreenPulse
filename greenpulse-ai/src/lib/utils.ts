import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 * Use this everywhere instead of raw template strings for className.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
