import { describe, expect, it } from 'vitest';
import { validateTicketSchema } from './schema';

const EVENT_ID = '00000000-0000-4000-8000-000000000001';

describe('gate schema', () => {
  it('aceita validação somente com token ou somente com código', () => {
    expect(
      validateTicketSchema.safeParse({ eventId: EVENT_ID, token: 'signed-qr-token' }).success,
    ).toBe(true);
    expect(validateTicketSchema.safeParse({ eventId: EVENT_ID, code: 'TICKET-CODE' }).success).toBe(
      true,
    );
  });

  it('rejeita token e código juntos', () => {
    const result = validateTicketSchema.safeParse({
      eventId: EVENT_ID,
      token: 'signed-qr-token',
      code: 'TICKET-CODE',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues[0]).toMatchObject({
      path: [],
      message: 'Use apenas QR ou código por validação.',
    });
  });

  it('rejeita validação sem token e sem código', () => {
    const result = validateTicketSchema.safeParse({ eventId: EVENT_ID });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues[0]).toMatchObject({
      path: [],
      message: 'Informe um QR ou código.',
    });
  });

  it('rejeita eventId que não é UUID', () => {
    const result = validateTicketSchema.safeParse({
      eventId: 'not-an-uuid',
      token: 'signed-qr-token',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues[0]).toMatchObject({
      path: ['eventId'],
      message: 'Selecione um evento válido.',
    });
  });
});
