'use server';

import type { AuthUser, UpdateProfileRequest } from '@app/shared';
import { api } from '@/shared/api';
import { updateProfileSchema } from './schema';

export async function updateProfile(input: unknown): Promise<AuthUser> {
  const data = updateProfileSchema.parse(input);
  const request: UpdateProfileRequest = {
    name: data.name,
    ...(data.newPassword
      ? {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }
      : {}),
  };

  return api.patch<AuthUser>('/auth/me', request);
}
