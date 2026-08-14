import { notFound } from 'next/navigation';
import { TicketDetailView } from '@/features/tickets/components/ticket-detail-view';
import { getSharedTicket } from '@/features/tickets/queries';

export const dynamic = 'force-dynamic';

export default async function SharedTicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ticket = await getSharedTicket(token);

  if (!ticket) {
    notFound();
  }

  return <TicketDetailView ticket={ticket} shared />;
}
