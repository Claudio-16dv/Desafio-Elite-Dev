import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { ShareLinkResponse } from '@app/shared';
import { TicketEntity } from '../entities/ticket.entity';
import { TicketForbiddenError } from '../errors/ticket-forbidden.error';
import { TicketNotFoundError } from '../errors/ticket-not-found.error';
import { TicketsRepository } from '../repositories/tickets.repository';

@Injectable()
export class CreateShareLinkUseCase {
  constructor(
    private readonly tickets: TicketsRepository,
    private readonly config: ConfigService,
  ) {}

  async execute(id: string, userId: string): Promise<ShareLinkResponse> {
    const ticket = await this.tickets.findById(id);
    if (!ticket) {
      throw new TicketNotFoundError();
    }
    if (ticket.userId !== userId) {
      throw new TicketForbiddenError();
    }

    const entity = new TicketEntity(ticket.id, ticket.status, ticket.usedAt ?? undefined);
    entity.assertCanBeShared(ticket.event.status);

    const shareToken = ticket.shareToken ?? randomBytes(24).toString('base64url');
    if (!ticket.shareToken) {
      await this.tickets.setShareToken(ticket.id, shareToken);
    }

    const baseUrl = this.config.get<string>('app.corsOrigin') ?? 'http://localhost:3000';
    return {
      shareToken,
      url: `${baseUrl}/share/${shareToken}`,
    };
  }
}
