export abstract class QrSigner {
  abstract sign(ticketId: string): string;
  abstract verify(token: string): string | null;
}
