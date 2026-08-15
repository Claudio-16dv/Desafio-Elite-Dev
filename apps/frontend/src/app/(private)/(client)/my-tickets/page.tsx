import { Ticket } from 'lucide-react';
import { TicketCard } from '@/features/tickets/components/ticket-card';
import { listMyTickets } from '@/features/tickets/queries';
import { Container, EmptyState, PageHeader } from '@/shared/ui';

export const dynamic = 'force-dynamic';

export default async function MyTicketsPage() {
  const tickets = await listMyTickets();

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Sua coleção"
        title="Meus ingressos"
        description="Seus ingressos ativos e o histórico de eventos ficam reunidos aqui."
      />
      {tickets.length ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={Ticket}
          title="Você ainda não tem ingressos"
          description="Escolha um evento, reserve seu assento e seus ingressos aparecerão aqui."
        />
      )}
    </Container>
  );
}
