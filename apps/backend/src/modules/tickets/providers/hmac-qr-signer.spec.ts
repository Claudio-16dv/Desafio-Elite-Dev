import { HmacQrSigner } from './hmac-qr-signer';

describe('HmacQrSigner', () => {
  const ticketId = '00000000-0000-4000-8000-000000000041';

  beforeEach(() => {
    process.env.QR_SECRET = 'test-qr-secret';
  });

  it('assina e verifica o identificador do ingresso', () => {
    const signer = new HmacQrSigner();

    expect(signer.verify(signer.sign(ticketId))).toBe(ticketId);
  });

  it('rejeita uma assinatura adulterada', () => {
    const signer = new HmacQrSigner();
    const [id, signature] = signer.sign(ticketId).split('.');
    const lastCharacter = signature.at(-1) === 'A' ? 'B' : 'A';
    const tamperedToken = `${id}.${signature.slice(0, -1)}${lastCharacter}`;

    expect(signer.verify(tamperedToken)).toBeNull();
  });
});
