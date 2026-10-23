import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'eRTMAC-NWIS — Nearby Wells Intelligence System',
  description: 'eRTMAC — AI-Powered Offset Well Knowledge and Decision Support Platform for Drilling Operations',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#071018] text-[#EAF4FA] min-h-screen antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
