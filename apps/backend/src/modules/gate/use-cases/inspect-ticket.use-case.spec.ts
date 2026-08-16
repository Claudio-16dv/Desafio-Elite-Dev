import { TicketStatus, ValidationOutcome } from '@app/shared';
import { QrSigner } from '../../tickets/providers/qr-signer';
import { TicketRecord, TicketsRepository } from '../../tickets/repositories/tickets.repository';
import { InspectTicketUseCase } from './inspect-ticket.use-case';

const EVENT_ID = '00000000-0000-4000-8000-000000000010';
const OTHER_EVENT_ID = '00000000-0000-4000-8000-000000000099';
const TICKET_ID = '00000000-0000-4000-8000-000000000041';
const ORGANIZER_ID = '00000000-0000-4000-8000-000000000001';
const OTHER_ORGANIZER_ID = '00000000-0000-4000-8000-000000000099';

function makeTicket(
  overrides: Partial<Pick<TicketRecord, 'eventId' | 'status'>> = {},
): TicketRecord {
  return {
    id: TICKET_ID,
    orderId: 'order-id',
    eventId: overrides.eventId ?? EVENT_ID,
    userId: 'user-id',
    seatId: 'seat-id',
    status: overrides.status ?? TicketStatus.VALID,
    code: 'SEEDAATKTA',
    shareToken: null,
    usedAt: null,
    event: {
      title: 'Show de Exemplo',
      startsAt: new Date('2026-08-20T20:00:00.000Z'),
      venue: 'Arena Central',
      status: 'PUBLISHED',
      organizerId: ORGANIZER_ID,
    },
    seat: { label: 'A1' },
  };
}

describe('InspectTicketUseCase', () => {
  const tickets = {
    findById: jest.fn(),
    findByCode: jest.fn(),
    markUsedIfValid: jest.fn(),
  };
  const qrSigner = {
    verify: jest.fn(),
  };
  const useCase = new InspectTicketUseCase(
    tickets as unknown as TicketsRepository,
    qrSigner as unknown as QrSigner,
  );
  const input = { eventId: EVENT_ID, token: 'valid-token' };

  beforeEach(() => {
    jest.resetAllMocks();
    qrSigner.verify.mockReturnValue(TICKET_ID);
  });

  it('retorna VALID com evento e assento sem marcar o ingresso', async () => {
    tickets.findById.mockResolvedValue(makeTicket());

    await expect(useCase.execute(input, ORGANIZER_ID)).resolves.toEqual({
      outcome: ValidationOutcome.VALID,
      ticketId: TICKET_ID,
      eventTitle: 'Show de Exemplo',
      seatLabel: 'A1',
    });

    expect(tickets.markUsedIfValid).not.toHaveBeenCalled();
  });

  it('retorna ALREADY_USED com evento e assento', async () => {
    tickets.findById.mockResolvedValue(makeTicket({ status: TicketStatus.USED }));

    await expect(useCase.execute(input, ORGANIZER_ID)).resolves.toEqual({
      outcome: ValidationOutcome.ALREADY_USED,
      eventTitle: 'Show de Exemplo',
      seatLabel: 'A1',
    });

    expect(tickets.markUsedIfValid).not.toHaveBeenCalled();
  });

  it('retorna WRONG_EVENT quando o ingresso pertence a outro evento', async () => {
    tickets.findById.mockResolvedValue(makeTicket({ eventId: OTHER_EVENT_ID }));

    await expect(useCase.execute(input, ORGANIZER_ID)).resolves.toEqual({
      outcome: ValidationOutcome.WRONG_EVENT,
    });

    expect(tickets.markUsedIfValid).not.toHaveBeenCalled();
  });

  it('retorna INVALID para ingresso de outro organizador', async () => {
    tickets.findById.mockResolvedValue(makeTicket());

    await expect(useCase.execute(input, OTHER_ORGANIZER_ID)).resolves.toEqual({
      outcome: ValidationOutcome.INVALID,
    });

    expect(tickets.markUsedIfValid).not.toHaveBeenCalled();
  });
});
