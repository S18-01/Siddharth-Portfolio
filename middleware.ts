import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { honeypotFeed } from './app/honeypotConfig';

// when the honeypot feed is hosted elsewhere, allow the browser to fetch it
const feedOrigin = /^https:\/\//.test(honeypotFeed) ? ' ' + new URL(honeypotFeed).origin : '';

/*
 * Strict Content Security Policy with a fresh nonce on every request.
 * Only scripts that carry this nonce (Next.js adds it to its own scripts automatically)
 * can run, so injected scripts are blocked without needing 'unsafe-inline'.
 */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') return NextResponse.next(); // dev mode needs eval for hot reload

  const nonce = btoa(crypto.randomUUID());
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "media-src 'self'",
    `connect-src 'self' https://api.web3forms.com${feedOrigin}`,
    "frame-src 'self' https://open.spotify.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico|images/|resume/|threat-twin\\.html$|.*\\.(?:png|jpg|jpeg|webp|svg|pdf|ico|txt|json|xml)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
