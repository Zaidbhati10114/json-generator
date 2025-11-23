// lib/utils.ts
import type { PromptCategory, GeneratedData } from '../../types/index';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getPromptCategory(prompt: string): PromptCategory {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('user') || lowerPrompt.includes('profile')) {
    return 'users';
  }
  if (lowerPrompt.includes('product') || lowerPrompt.includes('item')) {
    return 'products';
  }
  if (lowerPrompt.includes('post') || lowerPrompt.includes('article')) {
    return 'posts';
  }

  return 'general';
}

export function isValidJson(data: unknown): data is GeneratedData {
  if (data === null || data === undefined) {
    return false;
  }

  try {
    JSON.stringify(data);
    return typeof data === 'object';
  } catch {
    return false;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}