import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import {
  EventDetail,
  EventSummary,
  OrganizerEventSummary,
  Paginated,
  Role,
  SeatResponse,
} from '@app/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsDto } from './dto/list-events.dto';
import { ListMyEventsDto } from './dto/list-my-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CancelEventUseCase } from './use-cases/cancel-event.use-case';
import { CreateEventUseCase } from './use-cases/create-event.use-case';
import { GetEventSeatsUseCase } from './use-cases/get-event-seats.use-case';
import { GetEventUseCase } from './use-cases/get-event.use-case';
import { GetMyEventUseCase } from './use-cases/get-my-event.use-case';
import { ListEventsUseCase } from './use-cases/list-events.use-case';
import { ListMyEventsUseCase } from './use-cases/list-my-events.use-case';
import { PublishEventUseCase } from './use-cases/publish-event.use-case';
import { UpdateEventUseCase } from './use-cases/update-event.use-case';

@Controller('events')
export class EventsController {
  constructor(
    private readonly createEvent: CreateEventUseCase,
    private readonly updateEvent: UpdateEventUseCase,
    private readonly publishEvent: PublishEventUseCase,
    private readonly cancelEvent: CancelEventUseCase,
    private readonly getEvent: GetEventUseCase,
    private readonly getMyEvent: GetMyEventUseCase,
    private readonly listEvents: ListEventsUseCase,
    private readonly listMyEvents: ListMyEventsUseCase,
    private readonly getEventSeats: GetEventSeatsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EventDetail> {
    return this.createEvent.execute(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EventDetail> {
    return this.updateEvent.execute(id, dto, user.id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  publish(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<EventDetail> {
    return this.publishEvent.execute(id, user.id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  cancel(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<EventDetail> {
    return this.cancelEvent.execute(id, user.id);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  listMine(
    @Query() dto: ListMyEventsDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Paginated<OrganizerEventSummary>> {
    return this.listMyEvents.execute(dto, user.id);
  }

  @Get('mine/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER)
  getMine(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<EventDetail> {
    return this.getMyEvent.execute(id, user.id);
  }

  @Get()
  list(@Query() dto: ListEventsDto): Promise<Paginated<EventSummary>> {
    return this.listEvents.execute(dto);
  }

  @Get(':id/seats')
  seats(@Param('id') id: string): Promise<SeatResponse[]> {
    return this.getEventSeats.execute(id);
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<EventDetail> {
    return this.getEvent.execute(id);
  }
}
