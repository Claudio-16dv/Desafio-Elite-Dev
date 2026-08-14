import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <section
      className={cn(
        'flex flex-col items-center rounded-[--radius] border border-dashed border-border bg-card/40 px-6 py-14 text-center',
        className,
      )}
    >
      {Icon ? <Icon aria-hidden="true" className="mb-4 size-10 text-primary" /> : null}
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
