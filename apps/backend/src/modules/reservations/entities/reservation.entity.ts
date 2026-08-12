import { ReservationStatus } from '@app/shared';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { ReservationExpiredError } from '../errors/reservation-expired.error';
import { ReservationNotHeldError } from '../errors/reservation-not-held.error';

export class ReservationEntity {
  constructor(
    readonly id: string,
    readonly userId: string,
    private status: ReservationStatus,
    readonly expiresAt: Date,
  ) {}

  getStatus(): ReservationStatus {
    return this.status;
  }

  isExpired(now: Date): boolean {
    return this.status === ReservationStatus.HELD && this.expiresAt <= now;
  }

  confirm(now: Date): void {
    if (this.status !== ReservationStatus.HELD) {
      throw new ReservationNotHeldError();
    }
    if (this.isExpired(now)) {
      throw new ReservationExpiredError();
    }
    this.status = ReservationStatus.CONFIRMED;
  }

  release(): void {
    if (this.status === ReservationStatus.CONFIRMED) {
      throw new DomainException('Reserva já paga', 'RESERVATION_PAID', 409);
    }
    this.status = ReservationStatus.RELEASED;
  }
}
