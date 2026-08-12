import { randomBytes } from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateTicketCode(): string {
  const bytes = randomBytes(10);
  return Array.from(bytes, (byte) => BASE32_ALPHABET[byte % BASE32_ALPHABET.length]).join('');
}
