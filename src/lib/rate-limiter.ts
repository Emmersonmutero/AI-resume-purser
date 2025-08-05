import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }

  private getKey(request: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request);
    }
    
    // Default: use IP address and user ID if available
    const ip = this.getClientIP(request);
    const userId = request.headers.get('x-user-id');
    return userId ? `${userId}:${ip}` : ip;
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('x-remote-addr');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return realIP || remoteAddr || '127.0.0.1';
  }

  check(request: NextRequest): { allowed: boolean; resetTime?: number; remaining?: number } {
    const key = this.getKey(request);
    const now = Date.now();
    
    // Initialize or reset if window expired
    if (!this.store[key] || this.store[key].resetTime <= now) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      
      return {
        allowed: true,
        resetTime: this.store[key].resetTime,
        remaining: this.config.maxRequests - 1,
      };
    }
    
    // Increment count
    this.store[key].count++;
    
    const remaining = Math.max(0, this.config.maxRequests - this.store[key].count);
    const allowed = this.store[key].count <= this.config.maxRequests;
    
    return {
      allowed,
      resetTime: this.store[key].resetTime,
      remaining,
    };
  }
}

// Predefined rate limiters
export const generalRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // Lower limit for auth endpoints
  keyGenerator: (request) => {
    // Rate limit auth by IP only (no user ID available yet)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
              request.headers.get('x-real-ip') ||
              '127.0.0.1';
    return `auth:${ip}`;
  },
});

export const aiRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // Lower limit for AI endpoints
});

export const uploadRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // Very low limit for file uploads
});

export function withRateLimit(rateLimiter: RateLimiter) {
  return function(handler: (request: NextRequest) => Promise<Response>) {
    return async (request: NextRequest) => {
      const result = rateLimiter.check(request);
      
      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            resetTime: result.resetTime,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining?.toString() || '0',
              'X-RateLimit-Reset': Math.ceil((result.resetTime || 0) / 1000).toString(),
              'Retry-After': Math.ceil(((result.resetTime || 0) - Date.now()) / 1000).toString(),
            },
          }
        );
      }
      
      const response = await handler(request);
      
      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', rateLimiter['config'].maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining?.toString() || '0');
      response.headers.set('X-RateLimit-Reset', Math.ceil((result.resetTime || 0) / 1000).toString());
      
      return response;
    };
  };
}