import { ValidateTicketRequest } from '@app/shared';
import { QrSigner } from '../../tickets/providers/qr-signer';
import { TicketsRepository } from '../../tickets/repositories/tickets.repository';

export async function resolveTicketId(
  input: ValidateTicketRequest,
  tickets: TicketsRepository,
  qrSigner: QrSigner,
): Promise<string | null> {
  if (input.token) {
    return qrSigner.verify(input.token);
  }
  if (input.code) {
    const ticket = await tickets.findByCode(input.code);
    return ticket?.id ?? null;
  }
  return null;
}
