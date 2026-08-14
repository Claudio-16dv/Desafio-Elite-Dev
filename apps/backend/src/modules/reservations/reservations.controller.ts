import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReservationResponse, Role } from '@app/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { GetReservationUseCase } from './use-cases/get-reservation.use-case';
import { HoldSeatsUseCase } from './use-cases/hold-seats.use-case';
import { ReleaseReservationUseCase } from './use-cases/release-reservation.use-case';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT)
export class ReservationsController {
  constructor(
    private readonly holdSeats: HoldSeatsUseCase,
    private readonly getReservation: GetReservationUseCase,
    private readonly releaseReservation: ReleaseReservationUseCase,
  ) {}

  @Post()
  create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationResponse> {
    return this.holdSeats.execute(user.id, dto);
  }

  @Post(':id/release')
  release(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationResponse> {
    return this.releaseReservation.execute(id, user.id);
  }

  @Get(':id')
  getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationResponse> {
    return this.getReservation.execute(id, user.id);
  }
}
