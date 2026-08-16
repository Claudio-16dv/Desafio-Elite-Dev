import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  EventSummary,
  Role,
  TicketInspectionResponse,
  ValidationResultResponse,
} from '@app/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { InspectTicketUseCase } from './use-cases/inspect-ticket.use-case';
import { ListGateEventsUseCase } from './use-cases/list-gate-events.use-case';
import { ValidateTicketUseCase } from './use-cases/validate-ticket.use-case';

@Controller('gate')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GATE)
export class GateController {
  constructor(
    private readonly listGateEvents: ListGateEventsUseCase,
    private readonly inspectTicket: InspectTicketUseCase,
    private readonly validateTicket: ValidateTicketUseCase,
  ) {}

  @Get('events')
  listEvents(@CurrentUser() gate: AuthenticatedUser): Promise<EventSummary[]> {
    return this.listGateEvents.execute(gate.organizerId ?? null);
  }

  @Post('inspect')
  @HttpCode(HttpStatus.OK)
  inspect(
    @Body() dto: ValidateTicketDto,
    @CurrentUser() gate: AuthenticatedUser,
  ): Promise<TicketInspectionResponse> {
    return this.inspectTicket.execute(dto, gate.organizerId ?? null);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(
    @Body() dto: ValidateTicketDto,
    @CurrentUser() gate: AuthenticatedUser,
  ): Promise<ValidationResultResponse> {
    return this.validateTicket.execute(dto, gate.organizerId ?? null);
  }
}
