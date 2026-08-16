import { describe, expect, it } from 'vitest';
import { catalogSearchSchema, createEventActionSchema, eventFiltersSchema } from './schema';

function createEventInput(startsAt: string) {
  return {
    title: 'Show de Exemplo',
    venue: 'Arena Central',
    startsAt,
    price: '45,90',
    rows: 5,
    columns: 10,
  };
}

describe('event schemas', () => {
  it('rejeita intervalo com data final anterior e aponta para dateTo', () => {
    const result = eventFiltersSchema.safeParse({
      dateFrom: '2026-08-20',
      dateTo: '2026-08-19',
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['dateTo'],
          message: 'A data final deve ser igual ou posterior à data inicial.',
        }),
      ]),
    );
  });

  it('aceita intervalo válido e campos de data vazios', () => {
    expect(
      eventFiltersSchema.safeParse({
        dateFrom: '2026-08-19',
        dateTo: '2026-08-20',
      }).success,
    ).toBe(true);
    expect(eventFiltersSchema.safeParse({ dateFrom: '', dateTo: '' }).success).toBe(true);
  });

  it('rejeita data de calendário inválida', () => {
    const result = eventFiltersSchema.safeParse({ dateFrom: '2026-13-40' });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues[0]).toMatchObject({
      path: ['dateFrom'],
      message: 'Informe uma data válida.',
    });
  });

  it('exige fuso explícito no instante da ação do evento', () => {
    const withoutTimezone = createEventActionSchema.safeParse(
      createEventInput('2026-08-20T20:00:00'),
    );
    expect(withoutTimezone.success).toBe(false);
    if (!withoutTimezone.success) {
      expect(withoutTimezone.error.issues[0]).toMatchObject({
        path: ['startsAt'],
        message: 'Informe uma data e horário com fuso explícito.',
      });
    }

    expect(
      createEventActionSchema.safeParse(createEventInput('2026-08-20T20:00:00.000Z')).success,
    ).toBe(true);
    expect(
      createEventActionSchema.safeParse(createEventInput('2026-08-20T20:00:00-03:00')).success,
    ).toBe(true);
  });

  it('rejeita busca de catálogo com menos de dois caracteres', () => {
    const result = catalogSearchSchema.safeParse({ query: 'a' });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues[0]).toMatchObject({
      path: ['query'],
      message: 'Digite ao menos 2 caracteres.',
    });
  });
});
