import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names or conditional classes and merges Tailwind CSS classes efficiently.
 * Uses clsx for conditional class names and tailwind-merge to handle Tailwind class conflicts.
 * 
 * @param inputs - Array of class names, objects, or conditional expressions
 * @returns Merged and optimized class string
 * 
 * @example
 * cn('px-2 py-1', 'bg-blue-500', { 'text-white': true, 'rounded': false })
 * // Returns: 'px-2 py-1 bg-blue-500 text-white'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
