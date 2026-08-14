import 'server-only';

import type { AuthUser } from '@app/shared';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { api } from '@/shared/api';

export interface Session {
  user: AuthUser;
}

export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get('access_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const user = await api.get<AuthUser>('/auth/me');
    return { user };
  } catch {
    return null;
  }
});
