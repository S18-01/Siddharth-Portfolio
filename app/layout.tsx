import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';

const title = 'Siddharth Muragundla | Security Engineer · Pentest · SOC · Cloud';
const description = 'Security and penetration testing engineer with 4+ years in cybersecurity. Pentesting, SOC operations, cloud security, DevSecOps and ML for security. Based in Maryland, USA and open to relocation.';

export const metadata: Metadata = {
  metadataBase: new URL('https://siddharth-muragundla.vercel.app'),
  title,
  description,
  keywords: ['Siddharth Muragundla', 'Security Engineer', 'Penetration Tester', 'SOC Analyst', 'Cloud Security', 'DevSecOps', 'Cybersecurity', 'Maryland'],
  authors: [{ name: 'Siddharth Muragundla' }],
  openGraph: { title, description, type: 'profile', images: ['/images/siddharth-portrait.png'] },
  twitter: { card: 'summary_large_image', title, description, images: ['/images/siddharth-portrait.png'] },
};

export const viewport: Viewport = { themeColor: '#070c17' };

// Runs before first paint: restores the saved theme and skips the opening for returning visitors this session
const themeScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('sm-theme');d.dataset.theme=(t==='light'||t==='graphite')?t:'dark';if(sessionStorage.getItem('sm-booted'))d.dataset.seen='1'}catch(e){d.dataset.theme='dark'}})()`;

const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Siddharth Muragundla',
  jobTitle: 'Security Engineer',
  email: 'mailto:siddharthroy1435@gmail.com',
  address: { '@type': 'PostalAddress', addressRegion: 'Maryland', addressCountry: 'US' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Maryland, College Park' },
  sameAs: ['https://www.linkedin.com/in/siddhum', 'https://github.com/S18-01'],
  knowsAbout: ['Penetration Testing', 'Security Operations', 'Cloud Security', 'DevSecOps', 'Machine Learning for Security'],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // nonce from middleware.ts lets these two inline scripts pass the strict Content Security Policy
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
