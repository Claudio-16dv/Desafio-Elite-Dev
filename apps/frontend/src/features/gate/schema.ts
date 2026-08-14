import { z } from 'zod';

export const manualCodeSchema = z.object({
  code: z.string().trim().min(1, 'Informe o código do ingresso.'),
});

export const validateTicketSchema = z
  .object({
    eventId: z.string().uuid('Selecione um evento válido.'),
    token: z.string().trim().min(1, 'QR inválido.').optional(),
    code: z.string().trim().min(1, 'Código inválido.').optional(),
  })
  .superRefine((input, context) => {
    if (!input.token && !input.code) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe um QR ou código.' });
    }

    if (input.token && input.code) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Use apenas QR ou código por validação.',
      });
    }
  });

export type ManualCodeInput = z.infer<typeof manualCodeSchema>;
