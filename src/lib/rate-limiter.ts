// lib/rate-limiter.ts

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private requests: Map<string, RateLimitEntry> = new Map();
    private readonly limit: number;
    private readonly windowMs: number;

    constructor(limit: number = 3, windowMs: number = 60000) {
        this.limit = limit;
        this.windowMs = windowMs;

        // Clean up expired entries every minute
        setInterval(() => this.cleanup(), 60000);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.requests.entries()) {
            if (now > entry.resetTime) {
                this.requests.delete(key);
            }
        }
    }

    check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now();
        const entry = this.requests.get(identifier);

        // If no entry or time window expired, create new entry
        if (!entry || now > entry.resetTime) {
            const resetTime = now + this.windowMs;
            this.requests.set(identifier, { count: 1, resetTime });
            return { allowed: true, remaining: this.limit - 1, resetTime };
        }

        // Check if limit exceeded
        if (entry.count >= this.limit) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: entry.resetTime
            };
        }

        // Increment count
        entry.count++;
        this.requests.set(identifier, entry);

        return {
            allowed: true,
            remaining: this.limit - entry.count,
            resetTime: entry.resetTime
        };
    }

    reset(identifier: string): void {
        this.requests.delete(identifier);
    }
}

// Create a singleton instance
export const rateLimiter = new RateLimiter(3, 60000); // 3 requests per minute