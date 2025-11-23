// types/index.ts

/**
 * Represents any valid JSON value
 */
export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonObject
    | JsonArray;

export interface JsonObject {
    [key: string]: JsonValue;
}

export interface JsonArray extends Array<JsonValue> { }

/**
 * Generated data from the AI
 */
export type GeneratedData = JsonObject | JsonArray;

/**
 * API Response types
 */
export interface GenerateApiResponse {
    generatedData: GeneratedData;
    error?: string;
}

export interface LiveApiResponse {
    apiUrl: string;
    id: string;
    expiresAt: string;
    error?: string;
}

/**
 * Component Props types
 */
export interface QuickTemplate {
    id: string;
    label: string;
    prompt: string;
    icon: string;
}

export interface HistoryItem {
    id: string;
    prompt: string;
    data: GeneratedData;
    timestamp: number;
    apiUrl?: string;
}

/**
 * Database types
 */
export interface StoredUrl {
    _id?: string;
    shortId: string;
    data: GeneratedData;
    prompt: string;
    createdAt: Date;
    lastAccessed: Date;
    expiresAt: Date;
    accessCount: number;
}

/**
 * Prompt categories for skeleton loading
 */
export type PromptCategory =
    | 'users'
    | 'products'
    | 'posts'
    | 'general';

/**
 * Error types
 */
export interface ApiError {
    error: string;
    code?: string;
    details?: string;
}