import { Role } from '@app/shared';
import { describe, expect, it } from 'vitest';
import { createGateUserSchema, loginSchema, registerSchema } from './schema';

describe('auth schemas', () => {
  it('valida login com e-mail e senha', () => {
    const invalidEmail = loginSchema.safeParse({
      email: 'not-an-email',
      password: '12345678',
    });
    expect(invalidEmail.success).toBe(false);
    if (!invalidEmail.success) {
      expect(invalidEmail.error.issues[0]).toMatchObject({
        path: ['email'],
        message: 'Informe um e-mail válido.',
      });
    }

    const shortPassword = loginSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
    });
    expect(shortPassword.success).toBe(false);
    if (!shortPassword.success) {
      expect(shortPassword.error.issues[0]).toMatchObject({
        path: ['password'],
        message: 'A senha deve ter pelo menos 8 caracteres.',
      });
    }

    expect(loginSchema.safeParse({ email: 'user@example.com', password: '12345678' }).success).toBe(
      true,
    );
  });

  it('valida registro com nome, e-mail, senha e papel', () => {
    const shortName = registerSchema.safeParse({
      name: 'A',
      email: 'user@example.com',
      password: '12345678',
      role: Role.CLIENT,
    });
    expect(shortName.success).toBe(false);
    if (!shortName.success) {
      expect(shortName.error.issues[0]).toMatchObject({
        path: ['name'],
        message: 'Informe seu nome completo.',
      });
    }

    const invalidEmail = registerSchema.safeParse({
      name: 'User Example',
      email: 'not-an-email',
      password: '12345678',
      role: Role.CLIENT,
    });
    expect(invalidEmail.success).toBe(false);
    if (!invalidEmail.success) {
      expect(invalidEmail.error.issues[0]).toMatchObject({
        path: ['email'],
        message: 'Informe um e-mail válido.',
      });
    }

    const shortPassword = registerSchema.safeParse({
      name: 'User Example',
      email: 'user@example.com',
      password: '1234567',
      role: Role.CLIENT,
    });
    expect(shortPassword.success).toBe(false);
    if (!shortPassword.success) {
      expect(shortPassword.error.issues[0]).toMatchObject({
        path: ['password'],
        message: 'A senha deve ter pelo menos 8 caracteres.',
      });
    }

    expect(
      registerSchema.safeParse({
        name: 'User Example',
        email: 'user@example.com',
        password: '12345678',
        role: Role.CLIENT,
      }).success,
    ).toBe(true);
  });

  it('valida criação de porteiro', () => {
    const shortName = createGateUserSchema.safeParse({
      name: 'A',
      email: 'gate@example.com',
      password: '12345678',
    });
    expect(shortName.success).toBe(false);
    if (!shortName.success) {
      expect(shortName.error.issues[0]).toMatchObject({
        path: ['name'],
        message: 'Informe o nome do porteiro.',
      });
    }

    const invalidEmail = createGateUserSchema.safeParse({
      name: 'Gate User',
      email: 'not-an-email',
      password: '12345678',
    });
    expect(invalidEmail.success).toBe(false);
    if (!invalidEmail.success) {
      expect(invalidEmail.error.issues[0]).toMatchObject({
        path: ['email'],
        message: 'Informe um e-mail válido.',
      });
    }

    const shortPassword = createGateUserSchema.safeParse({
      name: 'Gate User',
      email: 'gate@example.com',
      password: '1234567',
    });
    expect(shortPassword.success).toBe(false);
    if (!shortPassword.success) {
      expect(shortPassword.error.issues[0]).toMatchObject({
        path: ['password'],
        message: 'A senha deve ter pelo menos 8 caracteres.',
      });
    }

    expect(
      createGateUserSchema.safeParse({
        name: 'Gate User',
        email: 'gate@example.com',
        password: '12345678',
      }).success,
    ).toBe(true);
  });
});
