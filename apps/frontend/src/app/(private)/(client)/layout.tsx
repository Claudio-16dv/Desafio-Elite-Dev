import { Role } from '@app/shared';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '@/shared/session/get-session';

export default async function ClientLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== Role.CLIENT) {
    redirect('/');
  }

  return children;
}
