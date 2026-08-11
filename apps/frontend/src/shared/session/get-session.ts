import 'server-only';
import { cache } from 'react';
import type { AuthUser } from '@app/shared';

export interface Session {
  user: AuthUser;
}

/**
 * Carrega a sessão uma vez por request (cache() deduplica as chamadas do layout
 * e das queries). A leitura real (cookie/token → /me do backend) entra na Spec
 * de Front-end. Por ora, retorna null (não autenticado).
 */
export const getSession = cache(async (): Promise<Session | null> => {
  return null;
});
