import { Role } from '@app/shared';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '@/shared/session/get-session';

export default async function OrganizerLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== Role.ORGANIZER) {
    redirect('/');
  }

  return children;
}
