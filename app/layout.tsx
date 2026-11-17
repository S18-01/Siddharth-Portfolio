import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
 title: 'Siddharth Muragundla | Security Engineering & Cloud',
 description: 'Portfolio of Siddharth Muragundla , security engineering, application security, cloud infrastructure, software development, and data-driven technologies.',
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
 return <html lang="en"><body>{children}</body></html>;
}
