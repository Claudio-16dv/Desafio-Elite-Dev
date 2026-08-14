import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '@/shared/session/get-session';
import { SessionProvider } from '@/shared/session/session-provider';

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return <SessionProvider value={session}>{children}</SessionProvider>;
}
