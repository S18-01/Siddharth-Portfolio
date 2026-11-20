# Siddharth Muragundla , Portfolio

Next.js 15 / React 19 / Tailwind CSS.

Cinematic redesign: sticky scroll-scrub hero (portrait turns under a spotlight while the headline cycles Security Engineer → Cloud Security → Threat Detection), profile card, focus areas, stack pills, projects, experience timeline, recognition, terminal contact and giant-name footer. All content lives in the arrays at the top of `app/page.tsx`; all styles in `app/globals.css`.

## Start

```powershell
npm.cmd install
npm.cmd run dev
```

Open the **exact URL** displayed by the terminal. Stop older development servers to avoid loading the previous portfolio.

## Before publishing

1. Set `NEXT_PUBLIC_GITHUB_URL` to your **real** GitHub profile URL (see `.env.example`). Until configured, GitHub links open GitHub.com rather than claiming an unverified profile.
2. Add your verified project repository URLs and technical write-ups. Project cards intentionally do not claim repo links that are not provided.
3. Add a real resume PDF and resume button after verifying the file.
4. Verify your LinkedIn link and all project descriptions.

The hero uses the user-selected portrait at `public/images/siddharth-portrait.png`.

Contact email: siddharthroy1435@gmail.com
GitHub: https://github.com/S18-01
Resume: intentionally omitted until the revised version is ready.


## Deploy (Vercel)

1. Push this folder to a GitHub repository.
2. On vercel.com, sign in with GitHub, click **Add New → Project**, import the repo and click **Deploy** (defaults are correct for Next.js).
3. Every `git push` redeploys automatically.

Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) are set in `next.config.mjs`. Check them at securityheaders.com after deploying.
