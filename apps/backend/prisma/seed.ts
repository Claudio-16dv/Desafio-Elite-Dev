import {
  EventStatus,
  OrderStatus,
  PrismaClient,
  ReservationStatus,
  Role,
  TicketStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'senha123';
const IDS = {
  organizer: '00000000-0000-4000-8000-000000000001',
  client1: '00000000-0000-4000-8000-000000000002',
  client2: '00000000-0000-4000-8000-000000000003',
  gate: '00000000-0000-4000-8000-000000000004',
  event: '00000000-0000-4000-8000-000000000010',
  reservation: '00000000-0000-4000-8000-000000000020',
  order: '00000000-0000-4000-8000-000000000030',
  ticketA1: '00000000-0000-4000-8000-000000000041',
  ticketA2: '00000000-0000-4000-8000-000000000042',
} as const;

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  const [organizer, client1, client2, gate] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'organizer@elite.dev' },
      update: { name: 'Organizador Elite', passwordHash, role: Role.ORGANIZER },
      create: {
        id: IDS.organizer,
        name: 'Organizador Elite',
        email: 'organizer@elite.dev',
        passwordHash,
        role: Role.ORGANIZER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'cliente1@elite.dev' },
      update: { name: 'Cliente Um', passwordHash, role: Role.CLIENT },
      create: {
        id: IDS.client1,
        name: 'Cliente Um',
        email: 'cliente1@elite.dev',
        passwordHash,
        role: Role.CLIENT,
      },
    }),
    prisma.user.upsert({
      where: { email: 'cliente2@elite.dev' },
      update: { name: 'Cliente Dois', passwordHash, role: Role.CLIENT },
      create: {
        id: IDS.client2,
        name: 'Cliente Dois',
        email: 'cliente2@elite.dev',
        passwordHash,
        role: Role.CLIENT,
      },
    }),
    prisma.user.upsert({
      where: { email: 'portaria@elite.dev' },
      update: { name: 'Portaria Elite', passwordHash, role: Role.GATE },
      create: {
        id: IDS.gate,
        name: 'Portaria Elite',
        email: 'portaria@elite.dev',
        passwordHash,
        role: Role.GATE,
      },
    }),
  ]);

  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 15);
  const event = await prisma.event.upsert({
    where: { id: IDS.event },
    update: {
      title: 'Show de Exemplo',
      description: 'Evento de demonstração para avaliação.',
      venue: 'Arena Central',
      startsAt,
      priceCents: 12_000,
      rows: 5,
      columns: 8,
      capacity: 40,
      status: EventStatus.PUBLISHED,
      source: 'seed',
      sourceId: 'show-de-exemplo',
      imageUrl: null,
      organizerId: organizer.id,
    },
    create: {
      id: IDS.event,
      title: 'Show de Exemplo',
      description: 'Evento de demonstração para avaliação.',
      venue: 'Arena Central',
      startsAt,
      priceCents: 12_000,
      rows: 5,
      columns: 8,
      capacity: 40,
      status: EventStatus.PUBLISHED,
      source: 'seed',
      sourceId: 'show-de-exemplo',
      organizerId: organizer.id,
    },
  });

  const seatInputs = Array.from({ length: 5 }, (_, rowIndex) => {
    const rowLabel = String.fromCharCode(65 + rowIndex);
    return Array.from({ length: 8 }, (_, columnIndex) => ({
      label: `${rowLabel}${columnIndex + 1}`,
      rowLabel,
      column: columnIndex + 1,
    }));
  }).flat();

  await prisma.$transaction(
    seatInputs.map((seat) =>
      prisma.seat.upsert({
        where: { eventId_label: { eventId: event.id, label: seat.label } },
        update: { rowLabel: seat.rowLabel, column: seat.column },
        create: { eventId: event.id, ...seat },
      }),
    ),
  );

  const seats = await prisma.seat.findMany({
    where: { eventId: event.id, label: { in: ['A1', 'A2'] } },
    select: { id: true, label: true },
  });
  const seatByLabel = new Map(seats.map((seat) => [seat.label, seat.id]));
  const a1 = seatByLabel.get('A1');
  const a2 = seatByLabel.get('A2');
  if (!a1 || !a2) {
    throw new Error('Assentos A1 e A2 não foram criados pelo seed');
  }

  const now = new Date();
  const reservation = await prisma.reservation.upsert({
    where: { id: IDS.reservation },
    update: {
      eventId: event.id,
      userId: client1.id,
      status: ReservationStatus.CONFIRMED,
      expiresAt: new Date(now.getTime() + 15 * 60_000),
    },
    create: {
      id: IDS.reservation,
      eventId: event.id,
      userId: client1.id,
      status: ReservationStatus.CONFIRMED,
      expiresAt: new Date(now.getTime() + 15 * 60_000),
    },
  });

  const order = await prisma.order.upsert({
    where: { id: IDS.order },
    update: {
      eventId: event.id,
      userId: client1.id,
      reservationId: reservation.id,
      status: OrderStatus.PAID,
      totalCents: 24_000,
    },
    create: {
      id: IDS.order,
      eventId: event.id,
      userId: client1.id,
      reservationId: reservation.id,
      status: OrderStatus.PAID,
      totalCents: 24_000,
    },
  });

  await prisma.$transaction([
    prisma.ticket.deleteMany({ where: { orderId: order.id } }),
    prisma.reservationSeat.deleteMany({ where: { reservationId: reservation.id } }),
  ]);

  await prisma.reservationSeat.createMany({
    data: [
      { reservationId: reservation.id, eventId: event.id, seatId: a1 },
      { reservationId: reservation.id, eventId: event.id, seatId: a2 },
    ],
  });

  await prisma.ticket.createMany({
    data: [
      {
        id: IDS.ticketA1,
        orderId: order.id,
        eventId: event.id,
        userId: client1.id,
        seatId: a1,
        status: TicketStatus.VALID,
        code: 'SEEDAATKTA',
      },
      {
        id: IDS.ticketA2,
        orderId: order.id,
        eventId: event.id,
        userId: client1.id,
        seatId: a2,
        status: TicketStatus.VALID,
        code: 'SEEDBBTKTB',
      },
    ],
  });

  console.log('[seed] dados criados/atualizados com sucesso');
  console.log('[seed] organizer@elite.dev / senha123 (ORGANIZER)');
  console.log('[seed] cliente1@elite.dev / senha123 (CLIENT, possui 2 ingressos)');
  console.log('[seed] cliente2@elite.dev / senha123 (CLIENT)');
  console.log('[seed] portaria@elite.dev / senha123 (GATE)');
  console.log(`[seed] usuários prontos: ${organizer.email}, ${client1.email}, ${client2.email}, ${gate.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
