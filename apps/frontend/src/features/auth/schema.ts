import { Role } from '@app/shared';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  role: z.enum([Role.CLIENT, Role.ORGANIZER]),
});

export const createGateUserSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do porteiro.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateGateUserInput = z.infer<typeof createGateUserSchema>;
