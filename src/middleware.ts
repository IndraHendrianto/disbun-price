import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the auth-token cookie
  const authToken = request.cookies.get('auth-token')?.value;

  // Paths that require authentications
  const isAuthRoute = request.nextUrl.pathname.startsWith('/admin');

  // If the user is trying to access a protected route and doesn't have a token, redirect to login
  if (isAuthRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user has a token and is trying to access the login page, redirect to admin
  if (request.nextUrl.pathname === '/login' && authToken) {
    const adminUrl = new URL('/admin/kelola-harga', request.url);
    return NextResponse.redirect(adminUrl);
  }

  // Otherwise, let the request proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/login'],
};
