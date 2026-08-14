'use client';

import type { AuthUser } from '@app/shared';
import { Role } from '@app/shared';
import {
  CalendarDays,
  ChevronsUpDown,
  CircleUserRound,
  House,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ScanLine,
  Ticket,
  UserPlus,
  WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Avatar, AvatarFallback } from './avatar';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Sheet, SheetContent, SheetTitle } from './sheet';

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavbarProps {
  user?: AuthUser | null;
  homeHref?: string;
  onLogout?: () => void;
}

const publicNavigation: NavigationItem[] = [
  { href: '/', label: 'Início', icon: House },
  { href: '/events', label: 'Eventos', icon: CalendarDays },
];

const navigationByRole: Record<Role, NavigationItem[]> = {
  [Role.CLIENT]: [
    { href: '/my-tickets', label: 'Meus ingressos', icon: Ticket },
    { href: '/orders', label: 'Meus pedidos', icon: WalletCards },
  ],
  [Role.ORGANIZER]: [
    { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
    { href: '/dashboard/gates/new', label: 'Cadastrar porteiro', icon: UserPlus },
  ],
  [Role.GATE]: [{ href: '/validate', label: 'Validar ingresso', icon: ScanLine }],
};

const roleLabel: Record<Role, string> = {
  [Role.ORGANIZER]: 'Organizador',
  [Role.CLIENT]: 'Cliente',
  [Role.GATE]: 'Portaria',
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function Brand({ href, onNavigate }: { href: string; onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label="CINENÉON — ir para a página inicial da sua área"
      className="flex shrink-0 items-center rounded-xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="min-w-0">
        <span className="block font-display text-base font-bold tracking-tight text-foreground">
          CINE<span className="text-primary">NÉON</span>
        </span>
        <span className="hidden text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">
          Eventos e experiências
        </span>
      </span>
    </Link>
  );
}

function findActiveHref(items: NavigationItem[], pathname: string) {
  return items
    .filter(
      (item) =>
        pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

interface NavigationProps {
  items: NavigationItem[];
  pathname: string;
  pendingHref: string | null;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
}

function DesktopNavigation({ items, pathname, pendingHref, onNavigate }: NavigationProps) {
  const activeHref = pendingHref ?? findActiveHref(items, pathname);
  const reduceMotion = useReducedMotion();

  return (
    <nav aria-label="Navegação principal" className="hidden min-w-0 items-center gap-1 lg:flex">
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(event) => onNavigate(event, item.href)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative isolate whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active ? (
              <motion.span
                layoutId="desktop-navigation-active"
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-lg bg-primary/12 ring-1 ring-primary/10"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 430, damping: 36, mass: 0.7 }
                }
              />
            ) : null}
            <span className="relative">{item.label}</span>
            {active ? (
              <motion.span
                layoutId="desktop-navigation-underline"
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 430, damping: 36, mass: 0.7 }
                }
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNavigation({ items, pathname, pendingHref, onNavigate }: NavigationProps) {
  const activeHref = pendingHref ?? findActiveHref(items, pathname);
  const reduceMotion = useReducedMotion();

  return (
    <nav aria-label="Navegação mobile" className="grid gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(event) => onNavigate(event, item.href)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative isolate flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active ? (
              <motion.span
                layoutId="mobile-navigation-active"
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-xl bg-primary/15 ring-1 ring-primary/20"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 430, damping: 36, mass: 0.7 }
                }
              />
            ) : null}
            <Icon aria-hidden="true" className="relative size-4.5 shrink-0" />
            <span className="relative">{item.label}</span>
            {active ? (
              <span
                aria-hidden="true"
                className="ml-auto size-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu({ user, onLogout }: { user: AuthUser; onLogout?: () => void }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Abrir menu da conta de ${user.name}`}
          className="group flex h-11 min-w-0 items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=open]:bg-muted"
        >
          <Avatar className="size-8 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
            <AvatarFallback className="bg-gradient-to-br from-primary/35 to-accent/25 text-primary-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 text-left xl:block">
            <span className="block max-w-32 truncate text-xs font-semibold text-foreground">
              {user.name}
            </span>
            <span className="block text-[0.65rem] text-muted-foreground">
              {roleLabel[user.role]}
            </span>
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className="hidden size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-[state=open]:rotate-180 xl:block"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={10}
        collisionPadding={12}
        className="w-64"
      >
        <DropdownMenuLabel className="p-2 font-normal">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-9 ring-1 ring-primary/30">
              <AvatarFallback className="bg-gradient-to-br from-primary/35 to-accent/25 text-primary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-border" />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <CircleUserRound aria-hidden="true" className="size-4" />
            Editar conta
          </Link>
        </DropdownMenuItem>
        {onLogout ? (
          <>
            <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-border" />
            <DropdownMenuItem
              className="text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger"
              onSelect={onLogout}
            >
              <LogOut aria-hidden="true" className="size-4" /> Sair
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar({ user, homeHref = '/', onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const roleNavigation = user ? navigationByRole[user.role] : [];
  const items = [...publicNavigation, ...roleNavigation];

  useEffect(() => {
    setPendingHref(null);
    setMobileOpen(false);
  }, [pathname]);

  function handleNavigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    setMobileOpen(false);
    if (href !== pathname) {
      setPendingHref(href);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/88 shadow-lg shadow-black/10 backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Brand href={homeHref} />
        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <DesktopNavigation
            items={items}
            pathname={pathname}
            pendingHref={pendingHref}
            onNavigate={handleNavigate}
          />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {user ? (
            <UserMenu user={user} onLogout={onLogout} />
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">
                  <LogIn aria-hidden="true" className="size-4" /> Entrar
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Criar conta</Link>
              </Button>
            </div>
          )}

          <Button
            type="button"
            aria-label="Abrir navegação"
            aria-controls="cineon-mobile-navigation"
            aria-expanded={mobileOpen}
            variant="ghost"
            size="sm"
            className="size-10 px-0 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          id="cineon-mobile-navigation"
          side="right"
          className="w-[min(88vw,22rem)] p-4"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <Brand href={homeHref} onNavigate={() => setMobileOpen(false)} />
          <div className="mt-8 flex-1 overflow-y-auto">
            <p className="mb-3 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Navegação
            </p>
            <MobileNavigation
              items={items}
              pathname={pathname}
              pendingHref={pendingHref}
              onNavigate={handleNavigate}
            />
          </div>
          {!user ? (
            <div className="grid gap-2 border-t border-border pt-4">
              <Button asChild variant="outline">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Entrar
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  Criar conta
                </Link>
              </Button>
            </div>
          ) : (
            <div className="border-t border-border pt-4 text-xs text-muted-foreground">
              Ações da conta disponíveis no seu avatar no topo.
            </div>
          )}
        </SheetContent>
      </Sheet>

      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-[-1px] h-px origin-left bg-gradient-to-r from-transparent via-primary to-accent shadow-[0_0_10px_var(--color-primary)] transition-[transform,opacity] duration-500 ease-out',
          pendingHref ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
        )}
      />
    </header>
  );
}
