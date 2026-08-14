'use client';

import type { EventSummary } from '@app/shared';
import { CalendarDays, MapPin, Ticket } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { Badge, Card } from '@/shared/ui';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function EventCard({ event }: { event: EventSummary }) {
  const startsAt = new Date(event.date);
  const reduceMotion = useReducedMotion();

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <motion.div
        whileHover={reduceMotion ? undefined : { y: -6 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full"
      >
        <Card className="flex h-full overflow-hidden transition-colors group-hover:border-primary/60">
          <div
            aria-hidden="true"
            className="h-32 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.5),_transparent_42%),linear-gradient(135deg,_rgba(139,92,246,0.8),_rgba(20,20,27,0.96)_60%)] p-5"
            style={
              event.imageUrl
                ? {
                    backgroundImage: `linear-gradient(135deg, rgba(10, 10, 15, 0.18), rgba(10, 10, 15, 0.82)), url(${event.imageUrl})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }
                : undefined
            }
          >
            <Badge className="border-white/20 bg-black/30 text-white backdrop-blur-sm">
              Evento
            </Badge>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-5">
            <div>
              <h2 className="font-display text-xl font-semibold leading-tight transition-colors group-hover:text-primary">
                {event.title}
              </h2>
              <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {event.venue}
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4 text-sm">
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
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
