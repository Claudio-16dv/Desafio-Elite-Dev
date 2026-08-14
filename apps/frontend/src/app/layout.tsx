import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AppShell } from '@/features/auth/components/app-shell';
import { getSession } from '@/shared/session/get-session';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CINENÉON — Eventos e Ingressos',
  description: 'Uma experiência cinematográfica para eventos e ingressos.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  return (
    <html lang="pt-BR">
      <body
        className={`${sora.variable} ${inter.variable} bg-background text-foreground antialiased`}
      >
        <AppShell user={session?.user}>{children}</AppShell>
        <Toaster richColors closeButton position="bottom-right" />
      </body>
    </html>
  );
}
