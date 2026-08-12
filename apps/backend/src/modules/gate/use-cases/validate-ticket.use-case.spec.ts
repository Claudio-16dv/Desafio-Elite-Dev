import { TicketStatus, ValidationOutcome } from '@app/shared';
import { QrSigner } from '../../tickets/providers/qr-signer';
import { TicketRecord, TicketsRepository } from '../../tickets/repositories/tickets.repository';
import { ValidateTicketUseCase } from './validate-ticket.use-case';

const EVENT_ID = '00000000-0000-4000-8000-000000000010';
const TICKET_ID = '00000000-0000-4000-8000-000000000041';

function makeTicket(eventId: string = EVENT_ID): TicketRecord {
  return {
    id: TICKET_ID,
    orderId: 'order-id',
    eventId,
    userId: 'user-id',
    seatId: 'seat-id',
    status: TicketStatus.VALID,
    code: 'SEEDAATKTA',
    shareToken: null,
    usedAt: null,
    event: { title: 'Show de Exemplo', startsAt: new Date(), venue: 'Arena Central' },
    seat: { label: 'A1' },
  };
}

describe('ValidateTicketUseCase', () => {
  const tickets = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
    findByShareToken: jest.fn(),
    findByCode: jest.fn(),
    setShareToken: jest.fn(),
    markUsedIfValid: jest.fn(),
  };
  const qrSigner = {
    sign: jest.fn(),
    verify: jest.fn(),
  };
  const useCase = new ValidateTicketUseCase(
    tickets as unknown as TicketsRepository,
    qrSigner as unknown as QrSigner,
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('retorna INVALID para token QR inválido', async () => {
    qrSigner.verify.mockReturnValue(null);

    await expect(useCase.execute({ eventId: EVENT_ID, token: 'invalid-token' })).resolves.toEqual({
      outcome: ValidationOutcome.INVALID,
    });
  });

  it('retorna WRONG_EVENT para ingresso de outro evento', async () => {
    qrSigner.verify.mockReturnValue(TICKET_ID);
    tickets.findById.mockResolvedValue(makeTicket('00000000-0000-4000-8000-000000000099'));

    await expect(useCase.execute({ eventId: EVENT_ID, token: 'valid-token' })).resolves.toEqual({
      outcome: ValidationOutcome.WRONG_EVENT,
    });
  });

  it('retorna VALID uma vez e ALREADY_USED na tentativa seguinte', async () => {
    qrSigner.verify.mockReturnValue(TICKET_ID);
    tickets.findById.mockResolvedValue(makeTicket());
    tickets.markUsedIfValid.mockResolvedValueOnce(1).mockResolvedValueOnce(0);

    await expect(useCase.execute({ eventId: EVENT_ID, token: 'valid-token' })).resolves.toEqual({
      outcome: ValidationOutcome.VALID,
      ticketId: TICKET_ID,
      seatLabel: 'A1',
    });
    await expect(useCase.execute({ eventId: EVENT_ID, token: 'valid-token' })).resolves.toEqual({
      outcome: ValidationOutcome.ALREADY_USED,
    });
  });
});
