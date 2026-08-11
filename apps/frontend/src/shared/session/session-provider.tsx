'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Session } from './get-session';

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({
  value,
  children,
}: {
  value: Session | null;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session | null {
  return useContext(SessionContext);
}
