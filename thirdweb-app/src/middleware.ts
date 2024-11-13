// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the user's authentication status (you'll need to implement this)
  const isAuthenticated = false; // Replace with actual auth check

  // Protected routes that require authentication
  const protectedPaths = ['/list-bike', '/profile', '/transactions'];
  
  const path = request.nextUrl.pathname;

  if (protectedPaths.includes(path) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/list-bike', '/profile', '/transactions']
};