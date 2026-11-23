import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));

// The Content Security Policy is set per request in middleware.ts (strict, nonce-based).

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pins the project root so Next.js ignores stray lockfiles elsewhere on the computer
  outputFileTracingRoot: root,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // RedForge X Threat Twin: a standalone page whose one script is allowed by its exact hash
      { source: '/threat-twin.html', headers: [{ key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'sha256-NI5RX5MSe90OQKG+wejuiZsSnqqNZjzFna5wa2wkUFw='; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; object-src 'none'; upgrade-insecure-requests" }] },
      // lets the official MITRE ATT&CK Navigator load my coverage layer
      { source: '/attack-layer.json', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }, { key: 'Cache-Control', value: 'public, max-age=3600' }] },
    ];
  },
};

export default nextConfig;
