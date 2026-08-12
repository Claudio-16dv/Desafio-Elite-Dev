import { EventInvalidStateError } from '../errors/event-invalid-state.error';
import { ForbiddenActionError } from '../errors/forbidden-action.error';

export type EventLifecycleStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

export class EventEntity {
  constructor(
    readonly id: string,
    readonly organizerId: string,
    private status: EventLifecycleStatus,
  ) {}

  getStatus(): EventLifecycleStatus {
    return this.status;
  }

  publish(): void {
    if (this.status !== 'DRAFT') {
      throw new EventInvalidStateError('Evento não pode ser publicado');
    }
    this.status = 'PUBLISHED';
  }

  cancel(): void {
    if (this.status !== 'DRAFT' && this.status !== 'PUBLISHED') {
      throw new EventInvalidStateError('Evento não pode ser cancelado');
    }
    this.status = 'CANCELLED';
  }

  canBeUpdated(): boolean {
    return this.status === 'DRAFT';
  }

  assertCanBeUpdated(): void {
    if (!this.canBeUpdated()) {
      throw new EventInvalidStateError('Apenas eventos em rascunho podem ser alterados');
    }
  }

  assertOwnedBy(userId: string): void {
    if (this.organizerId !== userId) {
      throw new ForbiddenActionError();
    }
  }
}
