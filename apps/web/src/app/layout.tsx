import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { PwaRegister } from '../components/pwa-register';

export const metadata: Metadata = {
  title: 'Nova IDE',
  description: 'Installable AI-powered coding workspace',
  applicationName: 'Nova IDE',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nova IDE',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
