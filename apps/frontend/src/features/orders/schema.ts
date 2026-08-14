import { z } from 'zod';

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid('Pedido inválido.'),
});
