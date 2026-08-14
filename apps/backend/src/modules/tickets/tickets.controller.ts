import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role, ShareLinkResponse, SharedTicketResponse, TicketResponse } from '@app/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CreateShareLinkUseCase } from './use-cases/create-share-link.use-case';
import { GetTicketUseCase } from './use-cases/get-ticket.use-case';
import { ListMyTicketsUseCase } from './use-cases/list-my-tickets.use-case';
import { ViewSharedTicketUseCase } from './use-cases/view-shared-ticket.use-case';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly listMyTickets: ListMyTicketsUseCase,
    private readonly getTicket: GetTicketUseCase,
    private readonly createShareLink: CreateShareLinkUseCase,
    private readonly viewSharedTicket: ViewSharedTicketUseCase,
  ) {}

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  mine(@CurrentUser() user: AuthenticatedUser): Promise<TicketResponse[]> {
    return this.listMyTickets.execute(user.id);
  }

  @Get('shared/:shareToken')
  shared(@Param('shareToken') shareToken: string): Promise<SharedTicketResponse> {
    return this.viewSharedTicket.execute(shareToken);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TicketResponse> {
    return this.getTicket.execute(id, user.id);
  }

  @Post(':id/share')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENT)
  share(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ShareLinkResponse> {
    return this.createShareLink.execute(id, user.id);
  }
}
