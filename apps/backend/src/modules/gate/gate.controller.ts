import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Role, ValidationResultResponse } from '@app/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { ValidateTicketUseCase } from './use-cases/validate-ticket.use-case';

@Controller('gate')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GATE)
export class GateController {
  constructor(private readonly validateTicket: ValidateTicketUseCase) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body() dto: ValidateTicketDto): Promise<ValidationResultResponse> {
    return this.validateTicket.execute(dto);
  }
}
