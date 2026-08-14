'use client';

import type { EventLifecycleStatus, OrganizerEventSummary } from '@app/shared';
import { ArrowRight, CalendarDays, MapPin, Ticket } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { BadgeProps } from '@/shared/ui';
import { Badge, Card } from '@/shared/ui';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const statusConfig: Record<
  EventLifecycleStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  DRAFT: { label: 'Rascunho', variant: 'warning' },
  PUBLISHED: { label: 'Publicado', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'danger' },
};

export function OrganizerEventCard({
  event,
  onManage,
}: {
  event: OrganizerEventSummary;
  onManage: () => void;
}) {
  const startsAt = new Date(event.date);
  const reduceMotion = useReducedMotion();
  const status = statusConfig[event.status];

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -5 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative h-full"
    >
      <Card className="flex h-full flex-col overflow-hidden transition-colors duration-200 group-hover:border-primary/60">
        <div
          aria-hidden="true"
          className="relative h-36 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.48),_transparent_42%),linear-gradient(135deg,_rgba(139,92,246,0.78),_rgba(20,20,27,0.96)_65%)]"
          style={
            event.imageUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(8, 8, 13, 0.12), rgba(8, 8, 13, 0.84)), url(${event.imageUrl})`,
                  backgroundPosition: 'center 28%',
                  backgroundSize: 'cover',
                }
              : undefined
          }
        >
          <Badge variant={status.variant} className="absolute left-4 top-4 backdrop-blur-md">
            {status.label}
          </Badge>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h2 className="font-display text-xl font-semibold leading-tight transition-colors group-hover:text-primary">
            {event.title}
          </h2>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {event.venue}
          </p>
          <div className="mt-5 grid gap-2 border-t border-border pt-4 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays aria-hidden="true" className="size-4 text-accent" />
              {Number.isNaN(startsAt.valueOf())
                ? 'Data a confirmar'
                : dateFormatter.format(startsAt)}
            </span>
            <span className="flex items-center gap-2 font-semibold text-foreground">
              <Ticket aria-hidden="true" className="size-4 text-primary" />
              {currencyFormatter.format(event.priceCents / 100)}
            </span>
          </div>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Gerenciar evento
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            />
          </span>
        </div>
      </Card>
      <button
        type="button"
        onClick={onManage}
        aria-label={`Gerenciar ${event.title}`}
        className="absolute inset-0 rounded-[--radius] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      />
    </motion.div>
  );
}
