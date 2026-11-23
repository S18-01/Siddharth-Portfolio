# Siddharth Muragundla · Security Engineer portfolio

[![Security](https://github.com/S18-01/Siddharth-Portfolio/actions/workflows/security.yml/badge.svg)](https://github.com/S18-01/Siddharth-Portfolio/actions/workflows/security.yml)
[![CodeQL](https://img.shields.io/badge/CodeQL-security--extended-2ea44f?logo=github)](https://github.com/S18-01/Siddharth-Portfolio/security/code-scanning)
[![Secrets](https://img.shields.io/badge/secrets-gitleaks-2ea44f)](https://github.com/S18-01/Siddharth-Portfolio/actions/workflows/security.yml)
[![Dependabot](https://img.shields.io/badge/dependabot-enabled-2ea44f?logo=dependabot)](https://github.com/S18-01/Siddharth-Portfolio/network/updates)
[![Mozilla Observatory](https://img.shields.io/badge/Mozilla%20Observatory-scan-blue?logo=mozilla)](https://developer.mozilla.org/en-US/observatory/analyze?host=siddharth-muragundla.vercel.app)
[![Security headers](https://img.shields.io/badge/securityheaders.com-scan-blue)](https://securityheaders.com/?q=siddharth-muragundla.vercel.app&followRedirects=on)
[![MITRE ATT&CK](https://img.shields.io/badge/MITRE%20ATT%26CK-coverage%20layer-red)](https://mitre-attack.github.io/attack-navigator/#layerURL=https%3A%2F%2Fsiddharth-muragundla.vercel.app%2Fattack-layer.json)

Live: **https://siddharth-muragundla.vercel.app**

Next.js 15 · React 19 · deployed on Vercel. Security engineer, Maryland, USA, open to relocation.

## What's inside

- **Proof lab**: 10 hands-on demos (site scan, SOC triage, Kubernetes hardening, attack chain, breach simulation, phishing analyzer, Sigma rules and more)
- **Live threat feed**: real attacks on my SSH honeypot (`honeypot/`, `docs/HONEYPOT_SETUP.md`)
- **ATT&CK coverage**: `public/attack-layer.json`, opens in the official MITRE ATT&CK Navigator
- **Hardened by default**: see [SECURITY.md](SECURITY.md)

## Run it

```powershell
npm.cmd install
npm.cmd run dev
```

Production check (this is where the strict CSP is active):

```powershell
npm.cmd run build
npm.cmd start
```

## Contact

siddharthroy1435@gmail.com · [LinkedIn](https://www.linkedin.com/in/siddhum) · [GitHub](https://github.com/S18-01)
