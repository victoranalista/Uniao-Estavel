import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const rateLimitOptions = {
  redis,
  limiter: Ratelimit.fixedWindow(1, '40 s'),
  analytics: false
};
export const passwordLimiter = new Ratelimit(rateLimitOptions);
export const otpLimiter = new Ratelimit(rateLimitOptions);
