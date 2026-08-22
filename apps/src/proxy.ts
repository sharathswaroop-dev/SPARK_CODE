import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes — redirect to /signin if no session cookie is present.
// Full session validation happens server-side in each API/page handler.
export function proxy(request: NextRequest) {
  // NextAuth v5 / Auth.js session cookie names (including chunked cookies like .0, .1)
  const allCookies = request.cookies.getAll();
  const hasSession = allCookies.some((cookie) =>
    cookie.name.includes('session-token') ||
    cookie.name.includes('next-auth.session-token') ||
    cookie.name === 'authjs.session-token' ||
    cookie.name === '__Secure-authjs.session-token'
  );

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/playground', '/problems/:path*', '/groups/:path*', '/profile'],
};
