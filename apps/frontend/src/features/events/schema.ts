import { z } from 'zod';

const optionalPrice = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d+$/.test(value), 'Informe um valor inteiro em reais.')
  .optional();

const moneySchema = z
  .string()
  .trim()
  .regex(/^\d+(?:[,.]\d{1,2})?$/, 'Informe um preço válido, como 45,90.');

function isValidCalendarDate(value: string) {
  if (value === '') {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value + 'T00:00:00.000Z');
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

const optionalDateSchema = z
  .string()
  .trim()
  .refine(isValidCalendarDate, 'Informe uma data válida.')
  .optional();

const localDateTimeSchema = z
  .string()
  .min(1, 'Informe a data e o horário.')
  .refine((value) => !Number.isNaN(new Date(value).valueOf()), 'Informe uma data válida.');

const explicitIsoInstantSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
      !Number.isNaN(Date.parse(value)),
    'Informe uma data e horário com fuso explícito.',
  );

export const eventFiltersSchema = z
  .object({
    query: z.string().trim().max(100, 'Use até 100 caracteres.').optional(),
    dateFrom: optionalDateSchema,
    dateTo: optionalDateSchema,
    minPrice: optionalPrice,
    maxPrice: optionalPrice,
  })
  .superRefine((value, context) => {
    if (value.dateFrom && value.dateTo && value.dateTo < value.dateFrom) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A data final deve ser igual ou posterior à data inicial.',
        path: ['dateTo'],
      });
    }
  });

export const catalogSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, 'Digite ao menos 2 caracteres.')
    .max(100, 'Use até 100 caracteres.'),
});

const eventBaseSchema = z.object({
  title: z.string().trim().min(2, 'Informe um título com ao menos 2 caracteres.'),
  description: z.string().trim().max(2_000, 'Use até 2000 caracteres.').optional(),
  venue: z.string().trim().min(2, 'Informe o local do evento.'),
  startsAt: localDateTimeSchema,
  price: moneySchema,
  imageUrl: z.union([z.string().trim().url('Informe uma URL válida.'), z.literal('')]).optional(),
});

export const createEventFormSchema = eventBaseSchema.extend({
  sourceId: z.string().trim().optional(),
  rows: z.coerce
    .number()
    .int()
    .min(1, 'Use ao menos uma fileira.')
    .max(26, 'Use no máximo 26 fileiras.'),
  columns: z.coerce
    .number()
    .int()
    .min(1, 'Use ao menos uma coluna.')
    .max(50, 'Use no máximo 50 colunas.'),
});

export const updateEventFormSchema = eventBaseSchema;
export const createEventActionSchema = createEventFormSchema.extend({
  startsAt: explicitIsoInstantSchema,
});
export const updateEventActionSchema = updateEventFormSchema.extend({
  startsAt: explicitIsoInstantSchema,
});
export const eventIdSchema = z.string().uuid('Evento inválido.');

export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
export type CatalogSearchInput = z.infer<typeof catalogSearchSchema>;
export type CreateEventFormInput = z.infer<typeof createEventFormSchema>;
export type UpdateEventFormInput = z.infer<typeof updateEventFormSchema>;
