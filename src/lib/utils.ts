import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple prompt categorization
export const getPromptCategory = (prompt: string) => {
  const lower = prompt.toLowerCase();
  if (lower.includes("user") || lower.includes("profile")) return "users";
  if (lower.includes("product") || lower.includes("item")) return "products";
  if (lower.includes("location") || lower.includes("address")) return "locations";
  if (lower.includes("api") || lower.includes("mock")) return "api";
  return "generic";
};

