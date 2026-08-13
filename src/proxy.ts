import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes — redirect to /signin if no session cookie is present.
// Full session validation happens server-side in each API/page handler.
export function proxy(request: NextRequest) {
  // NextAuth v5 JWT session cookie names
  const hasSession =
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token') ||
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token');

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
