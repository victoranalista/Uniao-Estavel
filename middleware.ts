import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { auth } from '@/lib/auth';
import {
  getClientIP,
  checkBlacklist,
  blockIp,
  log
} from '@/lib/middleware/utils';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isUploadRoute = pathname.startsWith('/file/upload');
  const rateLimitResponse = await rateLimitMiddleware(request, isUploadRoute);
  if (rateLimitResponse) return rateLimitResponse;
  return auth(request as any);
}

const rateLimitMiddleware = async (
  request: NextRequest,
  isUploadRoute: boolean
): Promise<NextResponse | null> => {
  const ip = getClientIP(request.headers);
  const prefix = isUploadRoute ? 'upload' : 'private';
  const status = await checkBlacklist(ip);
  if (status === 'static') {
    log({ ip, routeType: prefix, status: 403, reason: 'Static blacklist' });
    return new NextResponse('Forbidden - IP blocked (static)', { status: 403 });
  }
  if (status === 'dynamic') {
    log({ ip, routeType: prefix, status: 403, reason: 'Dynamic blacklist' });
    return new NextResponse('Forbidden - IP blocked (dynamic)', {
      status: 403
    });
  }
  const ratelimit = isUploadRoute ? uploadLimiter : privateLimiter;
  const { success } = await ratelimit.limit(`${prefix}:${ip}`);
  if (!success) {
    await blockIp(ip, prefix);
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  return null;
};

const redis = Redis.fromEnv();
const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, '60 s'),
  ephemeralCache: new Map(),
  analytics: true
});
const privateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '60 s'),
  ephemeralCache: new Map(),
  analytics: true
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|images|login|login/unauthorized|favicon\\.ico).*)'
  ]
};
