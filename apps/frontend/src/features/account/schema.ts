import { z } from 'zod';

const optionalPassword = z.union([
  z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  z.literal(''),
]);

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe um nome com pelo menos 2 caracteres.'),
    currentPassword: z.string().optional(),
    newPassword: optionalPassword.optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((input, context) => {
    if (!input.newPassword) {
      return;
    }

    if (!input.currentPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['currentPassword'],
        message: 'Informe sua senha atual.',
      });
    }

    if (input.newPassword !== input.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'As novas senhas não coincidem.',
      });
    }
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
