import { notFound } from 'next/navigation';
import { CheckoutFlow } from '@/features/checkout/components/checkout-flow';
import { getEventForCheckout } from '@/features/checkout/queries';
import { Container, PageHeader } from '@/shared/ui';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const checkout = await getEventForCheckout(eventId);

  if (!checkout) {
    notFound();
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Reserva"
        title="Escolha seu lugar"
        description={`Você está reservando assentos para ${checkout.event.title}.`}
      />
      <div className="mt-8">
        <CheckoutFlow event={checkout.event} seats={checkout.seats} />
      </div>
    </Container>
  );
}
