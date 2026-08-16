import { HandleStripeWebhookUseCase } from './handle-stripe-webhook.use-case';
import { PaymentGateway } from '../providers/payment.gateway';
import { OrderRecord, OrdersRepository } from '../repositories/orders.repository';

const PAYMENT_INTENT_ID = 'pi_test_123';
const ORDER_ID = 'order-id';

function makeOrder(): OrderRecord {
  return { id: ORDER_ID } as OrderRecord;
}

describe('HandleStripeWebhookUseCase', () => {
  const payments = {
    parseWebhookEvent: jest.fn(),
  };
  const orders = {
    findByPaymentIntentId: jest.fn(),
    confirmPaidAndIssueTickets: jest.fn(),
    expireOrder: jest.fn(),
  };
  const useCase = new HandleStripeWebhookUseCase(
    payments as unknown as PaymentGateway,
    orders as unknown as OrdersRepository,
  );
  const rawBody = Buffer.from('{"type":"event"}');
  const signature = 'signature';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('ignora eventos não relacionados a pedidos', async () => {
    payments.parseWebhookEvent.mockReturnValue({ type: 'ignored' });

    await useCase.execute(rawBody, signature);

    expect(payments.parseWebhookEvent).toHaveBeenCalledWith(rawBody, signature);
    expect(orders.findByPaymentIntentId).not.toHaveBeenCalled();
    expect(orders.confirmPaidAndIssueTickets).not.toHaveBeenCalled();
    expect(orders.expireOrder).not.toHaveBeenCalled();
  });

  it('não confirma succeeded quando o pedido não existe', async () => {
    payments.parseWebhookEvent.mockReturnValue({
      type: 'succeeded',
      paymentIntentId: PAYMENT_INTENT_ID,
    });
    orders.findByPaymentIntentId.mockResolvedValue(null);

    await useCase.execute(rawBody, signature);

    expect(orders.findByPaymentIntentId).toHaveBeenCalledWith(PAYMENT_INTENT_ID);
    expect(orders.confirmPaidAndIssueTickets).not.toHaveBeenCalled();
  });

  it('confirma succeeded para um pedido existente', async () => {
    payments.parseWebhookEvent.mockReturnValue({
      type: 'succeeded',
      paymentIntentId: PAYMENT_INTENT_ID,
    });
    orders.findByPaymentIntentId.mockResolvedValue(makeOrder());

    await useCase.execute(rawBody, signature);

    expect(orders.confirmPaidAndIssueTickets).toHaveBeenCalledWith(
      PAYMENT_INTENT_ID,
      expect.any(Date),
    );
    expect(orders.expireOrder).not.toHaveBeenCalled();
  });

  it('expira canceled para um pedido existente', async () => {
    payments.parseWebhookEvent.mockReturnValue({
      type: 'canceled',
      paymentIntentId: PAYMENT_INTENT_ID,
    });
    orders.findByPaymentIntentId.mockResolvedValue(makeOrder());

    await useCase.execute(rawBody, signature);

    expect(orders.expireOrder).toHaveBeenCalledWith(ORDER_ID);
    expect(orders.confirmPaidAndIssueTickets).not.toHaveBeenCalled();
  });

  it('propaga erro de assinatura inválida', async () => {
    const error = new Error('assinatura inválida');
    payments.parseWebhookEvent.mockImplementation(() => {
      throw error;
    });

    await expect(useCase.execute(rawBody, signature)).rejects.toBe(error);
    expect(orders.findByPaymentIntentId).not.toHaveBeenCalled();
  });
});
