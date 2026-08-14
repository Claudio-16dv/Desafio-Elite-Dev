'use client';

import type { AuthUser } from '@app/shared';
import { motion, useReducedMotion } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { Footer, Navbar } from '@/shared/ui';
import { logout } from '../actions';
import { homeByRole } from '../routes';

export function AppShell({ user, children }: { user?: AuthUser | null; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  async function handleLogout() {
    try {
      await logout();
      toast.success('Sessão encerrada. Até logo!');
      router.replace('/login');
      router.refresh();
    } catch {
      toast.error('Não foi possível encerrar a sessão. Tente novamente.');
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Navbar
        user={user}
        homeHref={user ? homeByRole(user.role) : '/'}
        onLogout={user ? handleLogout : undefined}
      />
      <motion.main
        key={pathname}
        data-page-content=""
        className="flex-1"
        initial={reduceMotion ? false : { opacity: 0.78, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
