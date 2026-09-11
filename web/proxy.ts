import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

const clerkHandler = clerkMiddleware();

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const url = new URL(req.url);

  // We await the response from clerkMiddleware to inspect it.
  const response = (await clerkHandler(req, event)) as NextResponse | undefined;

  // If this is a handshake request and it fails (e.g. returning 400 host_invalid JSON),
  // we intercept it to prevent the user from seeing a raw JSON error page.
  if (url.pathname.startsWith('/__clerk/v1/client/handshake')) {
    if (response && response.status >= 400) {
      // Graceful authentication reset
      const redirectUrl = new URL(
        process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/',
        req.url
      );
      const res = NextResponse.redirect(redirectUrl);

      // Delete the stale session cookies to prevent infinite handshake loops
      res.cookies.delete('__session');
      res.cookies.delete('__client_uat');

      return res;
    }
  }

  // Next.js middleware requires returning a Response object if returning from a custom handler
  return response || NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk internal proxy routes
    '/__clerk/(.*)',
  ],
};
