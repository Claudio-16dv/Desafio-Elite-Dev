import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { EventCard } from '@/features/events/components/event-card';
import { listPublished } from '@/features/events/queries';
import { Hero } from '@/features/home/components/hero';
import { Reveal } from '@/shared/ui/motion/reveal';
import { Button, Container, EmptyState, PageHeader } from '@/shared/ui';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const events = await listPublished({ pageSize: 6 });

  return (
    <>
      <Hero />
      <Container data-page-reveal-group={undefined} className="py-14 sm:py-20">
        <Reveal>
          <PageHeader
            eyebrow="Em cartaz"
            title="Eventos em destaque"
            description="Seleções para transformar uma noite comum em uma boa história."
            actions={
              <Button asChild variant="outline">
                <Link href="/events">Ver todos</Link>
              </Button>
            }
          />
        </Reveal>
        {events.items.length ? (
          <Reveal delay={0.08} className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </Reveal>
        ) : (
          <Reveal delay={0.08}>
            <EmptyState
              className="mt-8"
              icon={CalendarDays}
              title="Nada em cartaz por enquanto"
              description="Novas experiências aparecerão aqui assim que forem publicadas."
            />
          </Reveal>
        )}
      </Container>
    </>
  );
}
