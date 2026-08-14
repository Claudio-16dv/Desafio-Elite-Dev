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

const dateTimeSchema = z
  .string()
  .min(1, 'Informe a data e o horário.')
  .refine((value) => !Number.isNaN(new Date(value).valueOf()), 'Informe uma data válida.');

export const eventFiltersSchema = z.object({
  query: z.string().trim().max(100, 'Use até 100 caracteres.').optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minPrice: optionalPrice,
  maxPrice: optionalPrice,
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
  startsAt: dateTimeSchema,
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
export const eventIdSchema = z.string().uuid('Evento inválido.');

export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
export type CatalogSearchInput = z.infer<typeof catalogSearchSchema>;
export type CreateEventFormInput = z.infer<typeof createEventFormSchema>;
export type UpdateEventFormInput = z.infer<typeof updateEventFormSchema>;
