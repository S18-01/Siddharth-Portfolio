# Security policy

This site is a security engineer's portfolio, so it is held to the standard it talks about.

## How it is protected

- **Strict Content Security Policy**: a fresh nonce on every request with `strict-dynamic`. No inline script runs unless the server signed it (`middleware.ts`).
- **Transport**: HSTS for two years with `includeSubDomains` and `preload`; TLS is handled by Vercel.
- **Browser isolation**: `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `Cross-Origin-Opener-Policy: same-origin`, `X-Content-Type-Options: nosniff`, a strict `Referrer-Policy`, and a `Permissions-Policy` that turns off camera, microphone, location, payment and USB.
- **Pipeline** (`.github/workflows/security.yml`), on every push and every Monday:
  - CodeQL static analysis (`security-extended` queries)
  - gitleaks secret scan of the full git history
  - `npm audit` that fails on high or critical vulnerabilities
  - a live check that the deployed site still sends every header and that scripts stay nonce-only
- **Dependabot** keeps npm packages and GitHub Actions up to date.
- **No secrets in the repo.** The contact form uses a public Web3Forms access key that only delivers mail to me.

## Verify it yourself

- Mozilla Observatory: https://developer.mozilla.org/en-US/observatory/analyze?host=siddharth-muragundla.vercel.app
- securityheaders.com: https://securityheaders.com/?q=siddharth-muragundla.vercel.app&followRedirects=on
- SSL Labs: https://www.ssllabs.com/ssltest/analyze.html?d=siddharth-muragundla.vercel.app

## Reporting a vulnerability

Found something? Thank you. Please email **siddharthroy1435@gmail.com** with the subject `SECURITY` and steps to reproduce. I reply within 48 hours and credit reporters who want it. Please don't run denial-of-service tests or automated scans that flood the contact form.

Also published at `/.well-known/security.txt`.
