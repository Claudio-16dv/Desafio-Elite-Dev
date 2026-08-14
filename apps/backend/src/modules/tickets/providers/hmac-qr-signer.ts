import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { QrSigner } from './qr-signer';

@Injectable()
export class HmacQrSigner extends QrSigner {
  sign(ticketId: string): string {
    const signature = this.createSignature(ticketId);
    return `${ticketId}.${signature}`;
  }

  verify(token: string): string | null {
    const [ticketId, signature, ...extra] = token.split('.');
    if (!ticketId || !signature || extra.length) {
      return null;
    }

    const expected = this.createSignature(ticketId);
    const receivedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (receivedBuffer.length !== expectedBuffer.length) {
      return null;
    }

    return crypto.timingSafeEqual(receivedBuffer, expectedBuffer) ? ticketId : null;
  }

  private createSignature(ticketId: string): string {
    return crypto.createHmac('sha256', process.env.QR_SECRET!).update(ticketId).digest('base64url');
  }
}
