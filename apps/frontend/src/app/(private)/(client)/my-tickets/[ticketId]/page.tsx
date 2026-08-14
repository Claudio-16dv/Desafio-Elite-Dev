import { notFound } from 'next/navigation';
import { TicketDetailView } from '@/features/tickets/components/ticket-detail-view';
import { getTicketById } from '@/features/tickets/queries';

export const dynamic = 'force-dynamic';

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    notFound();
  }

  return <TicketDetailView ticket={ticket} />;
}
