import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { EventsController } from './events.controller';
import { PrismaEventsRepository } from './repositories/prisma-events.repository';
import { EventsRepository } from './repositories/events.repository';
import { CancelEventUseCase } from './use-cases/cancel-event.use-case';
import { CreateEventUseCase } from './use-cases/create-event.use-case';
import { GetEventSeatsUseCase } from './use-cases/get-event-seats.use-case';
import { GetEventUseCase } from './use-cases/get-event.use-case';
import { ListEventsUseCase } from './use-cases/list-events.use-case';
import { PublishEventUseCase } from './use-cases/publish-event.use-case';
import { UpdateEventUseCase } from './use-cases/update-event.use-case';

@Module({
  imports: [CatalogModule],
  controllers: [EventsController],
  providers: [
    CreateEventUseCase,
    UpdateEventUseCase,
    PublishEventUseCase,
    CancelEventUseCase,
    GetEventUseCase,
    ListEventsUseCase,
    GetEventSeatsUseCase,
    { provide: EventsRepository, useClass: PrismaEventsRepository },
  ],
  exports: [EventsRepository],
})
export class EventsModule {}
