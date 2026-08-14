import { ReceiptText } from 'lucide-react';
import { OrderCard } from '@/features/orders/components/order-card';
import { listMyOrders } from '@/features/orders/queries';
import { Container, EmptyState, PageHeader } from '@/shared/ui';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await listMyOrders();

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Histórico"
        title="Meus pedidos"
        description="Acompanhe pagamentos e cancele pedidos pagos com devolução dos assentos."
      />
      {orders.length ? (
        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          icon={ReceiptText}
          title="Nenhum pedido por aqui"
          description="Seus pagamentos aparecerão nesta área depois de uma reserva."
        />
      )}
    </Container>
  );
}
