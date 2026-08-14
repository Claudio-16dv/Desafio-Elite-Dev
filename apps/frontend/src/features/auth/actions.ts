'use server';

import type { AuthUser, LoginResponse } from '@app/shared';
import { cookies } from 'next/headers';
import { api } from '@/shared/api';
import { createGateUserSchema, loginSchema, registerSchema } from './schema';

const COOKIE_NAME = 'access_token';
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24,
};

export async function login(input: unknown): Promise<AuthUser> {
  const data = loginSchema.parse(input);
  const response = await api.post<LoginResponse>('/auth/login', data);

  (await cookies()).set(COOKIE_NAME, response.accessToken, cookieOptions);
  return response.user;
}

export async function register(input: unknown): Promise<AuthUser> {
  const data = registerSchema.parse(input);
  const response = await api.post<LoginResponse>('/auth/register', data);

  (await cookies()).set(COOKIE_NAME, response.accessToken, cookieOptions);
  return response.user;
}

export async function createGateUser(input: unknown): Promise<AuthUser> {
  const data = createGateUserSchema.parse(input);
  return api.post<AuthUser>('/auth/gates', data);
}

export async function logout(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}
