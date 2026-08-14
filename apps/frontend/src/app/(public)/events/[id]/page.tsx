import { Role } from '@app/shared';
import { notFound } from 'next/navigation';
import { EventDetailView } from '@/features/events/components/event-detail-view';
import { getEventById } from '@/features/events/queries';
import { getSession } from '@/shared/session/get-session';

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, session] = await Promise.all([getEventById(id), getSession()]);

  if (!event) {
    notFound();
  }

  const isClient = session?.user.role === Role.CLIENT;
  const reservationHref = isClient ? `/checkout/${event.id}` : '/login';
  const reservationLabel = isClient ? 'Escolher assentos' : 'Entre para reservar';

  return (
    <EventDetailView
      event={event}
      reservationHref={reservationHref}
      reservationLabel={reservationLabel}
    />
  );
}
