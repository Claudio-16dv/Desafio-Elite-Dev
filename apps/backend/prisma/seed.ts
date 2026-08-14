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
const TOTAL_EVENTS = 12;
const CATALOG_EVENTS = TOTAL_EVENTS - 1;
const TMDB_ATTEMPTS = 3;
const TMDB_TIMEOUT_MS = 8_000;

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

interface CatalogSeedItem {
  source: 'tmdb' | 'seed';
  sourceId: string;
  title: string;
  overview: string;
  imageUrl?: string;
}

interface TmdbMovie {
  id: number;
  title?: string;
  overview?: string | null;
  poster_path?: string | null;
}

interface TmdbPopularResponse {
  results?: TmdbMovie[];
}

const fallbackCatalog: CatalogSeedItem[] = [
  {
    source: 'seed',
    sourceId: 'fallback-luzes-da-cidade',
    title: 'Luzes da Cidade',
    overview: 'Uma noite de cinema, música e encontros no coração da cidade.',
  },
  {
    source: 'seed',
    sourceId: 'fallback-horizonte-infinito',
    title: 'Horizonte Infinito',
    overview: 'Uma aventura visual sobre coragem, amizade e novos começos.',
  },
  {
    source: 'seed',
    sourceId: 'fallback-ritmo-das-estrelas',
    title: 'O Ritmo das Estrelas',
    overview: 'Espetáculo audiovisual que mistura trilha ao vivo e projeções imersivas.',
  },
  {
    source: 'seed',
    sourceId: 'fallback-ultima-sessao',
    title: 'A Última Sessão',
    overview: 'Uma celebração nostálgica das histórias que marcaram gerações.',
  },
  {
    source: 'seed',
    sourceId: 'fallback-caminhos-do-tempo',
    title: 'Caminhos do Tempo',
    overview: 'Drama emocionante apresentado em uma sessão especial comentada.',
  },
  {
    source: 'seed',
    sourceId: 'fallback-noite-neon',
    title: 'Noite Neon',
    overview: 'Cinema e cultura pop em uma experiência noturna cheia de cor.',
  },
  {
    source: 'seed',
    sourceId: 'fallback-alem-do-palco',
    title: 'Além do Palco',
    overview: 'Bastidores, música e histórias de quem vive para o espetáculo.',
  },
  {
    source: 'seed',
    sourceId: 'fallback-memorias-do-amanha',
    title: 'Memórias do Amanhã',
    overview: 'Ficção científica e debate sobre tecnologia, afeto e futuro.',
  },
  {
    source: 'seed',
    sourceId: 'fallback-entre-cenas',
    title: 'Entre Cenas',
    overview: 'Uma mostra especial de narrativas brasileiras contemporâneas.',
  },
  {
    source: 'seed',
    sourceId: 'fallback-eco-da-montanha',
    title: 'O Eco da Montanha',
    overview: 'Documentário e conversa sobre natureza, aventura e preservação.',
  },
  {
    source: 'seed',
    sourceId: 'fallback-grande-estreia',
    title: 'A Grande Estreia',
    overview: 'Tapete roxo, sessão especial e uma noite feita para fãs de cinema.',
  },
];

const venues = [
  'Cinéon Aurora — Sala 1',
  'Cinéon Aurora — Sala 2',
  'Teatro Central',
  'Arena das Artes',
  'Cine Drive Cidade',
  'Espaço Cultural Horizonte',
];

function addDays(base: Date, days: number, hour: number): Date {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function eventIdForSlot(slot: number): string {
  return '00000000-0000-4000-8000-' + String(slot).padStart(12, '0');
}

function seatsForGrid(rows: number, columns: number) {
  return Array.from({ length: rows }, (_, rowIndex) => {
    const rowLabel = String.fromCharCode(65 + rowIndex);
    return Array.from({ length: columns }, (_, columnIndex) => ({
      label: rowLabel + String(columnIndex + 1),
      rowLabel,
      column: columnIndex + 1,
    }));
  }).flat();
}

async function loadTmdbCatalog(limit: number): Promise<CatalogSeedItem[]> {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    return [];
  }

  const baseUrl = (process.env.TMDB_BASE_URL ?? 'https://api.themoviedb.org/3').replace(/\/$/, '');
  const url = new URL(baseUrl + '/movie/popular');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('language', 'pt-BR');
  url.searchParams.set('page', '1');

  for (let attempt = 1; attempt <= TMDB_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(TMDB_TIMEOUT_MS) });

      if (response.ok) {
        const payload = (await response.json()) as TmdbPopularResponse;
        return (payload.results ?? [])
          .filter((movie): movie is TmdbMovie & { title: string } =>
            Boolean(movie.id && movie.title),
          )
          .slice(0, limit)
          .map((movie) => ({
            source: 'tmdb' as const,
            sourceId: String(movie.id),
            title: movie.title,
            overview:
              movie.overview?.trim() ||
              'Sessão especial inspirada em um dos títulos mais populares do momento.',
            imageUrl: movie.poster_path
              ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path
              : undefined,
          }));
      }

      console.warn(
        '[seed] TMDb tentativa ' + attempt + '/' + TMDB_ATTEMPTS + ' respondeu ' + response.status,
      );
      if ([401, 403].includes(response.status)) {
        break;
      }
    } catch (error) {
      console.warn(
        '[seed] TMDb tentativa ' +
          attempt +
          '/' +
          TMDB_ATTEMPTS +
          ' falhou (' +
          (error instanceof Error ? error.name : 'erro desconhecido') +
          ')',
      );
    }

    if (attempt < TMDB_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  console.warn('[seed] TMDb indisponível após tentativas; usando catálogo local de fallback');
  return [];
}

async function seedEvents(organizerId: string) {
  const now = new Date();
  const mainEvent = await prisma.event.upsert({
    where: { id: IDS.event },
    update: {
      title: 'Show de Exemplo',
      description: 'Evento de demonstração para avaliação.',
      venue: 'Arena Central',
      startsAt: addDays(now, 15, 20),
      priceCents: 12_000,
      rows: 5,
      columns: 8,
      capacity: 40,
      status: EventStatus.PUBLISHED,
      source: 'seed',
      sourceId: 'show-de-exemplo',
      imageUrl: null,
      organizerId,
    },
    create: {
      id: IDS.event,
      title: 'Show de Exemplo',
      description: 'Evento de demonstração para avaliação.',
      venue: 'Arena Central',
      startsAt: addDays(now, 15, 20),
      priceCents: 12_000,
      rows: 5,
      columns: 8,
      capacity: 40,
      status: EventStatus.PUBLISHED,
      source: 'seed',
      sourceId: 'show-de-exemplo',
      organizerId,
    },
  });

  await prisma.seat.createMany({
    data: seatsForGrid(5, 8).map((seat) => ({ eventId: mainEvent.id, ...seat })),
    skipDuplicates: true,
  });

  const tmdbItems = await loadTmdbCatalog(CATALOG_EVENTS);
  const catalogItems = [...tmdbItems, ...fallbackCatalog].slice(0, CATALOG_EVENTS);

  for (const [index, item] of catalogItems.entries()) {
    const rows = 4 + (index % 4);
    const columns = 8 + (index % 5);
    const eventId = eventIdForSlot(11 + index);
    const event = await prisma.event.upsert({
      where: { id: eventId },
      update: {
        title: item.title,
        description: item.overview,
        venue: venues[index % venues.length],
        startsAt: addDays(now, 5 + index * 3, 18 + (index % 4)),
        priceCents: 4_500 + (index % 6) * 1_500,
        rows,
        columns,
        capacity: rows * columns,
        status: EventStatus.PUBLISHED,
        source: item.source,
        sourceId: item.sourceId,
        imageUrl: item.imageUrl ?? null,
        organizerId,
      },
      create: {
        id: eventId,
        title: item.title,
        description: item.overview,
        venue: venues[index % venues.length],
        startsAt: addDays(now, 5 + index * 3, 18 + (index % 4)),
        priceCents: 4_500 + (index % 6) * 1_500,
        rows,
        columns,
        capacity: rows * columns,
        status: EventStatus.PUBLISHED,
        source: item.source,
        sourceId: item.sourceId,
        imageUrl: item.imageUrl,
        organizerId,
      },
    });

    await prisma.seat.createMany({
      data: seatsForGrid(rows, columns).map((seat) => ({ eventId: event.id, ...seat })),
      skipDuplicates: true,
    });
  }

  return {
    mainEvent,
    tmdbCount: tmdbItems.length,
    fallbackCount: TOTAL_EVENTS - tmdbItems.length,
  };
}

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

  const { mainEvent, tmdbCount, fallbackCount } = await seedEvents(organizer.id);
  const seats = await prisma.seat.findMany({
    where: { eventId: mainEvent.id, label: { in: ['A1', 'A2'] } },
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
      eventId: mainEvent.id,
      userId: client1.id,
      status: ReservationStatus.CONFIRMED,
      expiresAt: new Date(now.getTime() + 15 * 60_000),
    },
    create: {
      id: IDS.reservation,
      eventId: mainEvent.id,
      userId: client1.id,
      status: ReservationStatus.CONFIRMED,
      expiresAt: new Date(now.getTime() + 15 * 60_000),
    },
  });

  const order = await prisma.order.upsert({
    where: { id: IDS.order },
    update: {
      eventId: mainEvent.id,
      userId: client1.id,
      reservationId: reservation.id,
      status: OrderStatus.PAID,
      totalCents: 24_000,
    },
    create: {
      id: IDS.order,
      eventId: mainEvent.id,
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
      { reservationId: reservation.id, eventId: mainEvent.id, seatId: a1 },
      { reservationId: reservation.id, eventId: mainEvent.id, seatId: a2 },
    ],
  });

  await prisma.ticket.createMany({
    data: [
      {
        id: IDS.ticketA1,
        orderId: order.id,
        eventId: mainEvent.id,
        userId: client1.id,
        seatId: a1,
        status: TicketStatus.VALID,
        code: 'SEEDAATKTA',
      },
      {
        id: IDS.ticketA2,
        orderId: order.id,
        eventId: mainEvent.id,
        userId: client1.id,
        seatId: a2,
        status: TicketStatus.VALID,
        code: 'SEEDBBTKTB',
      },
    ],
  });

  console.log(
    '[seed] ' +
      TOTAL_EVENTS +
      ' eventos prontos (TMDb: ' +
      tmdbCount +
      '; fallback: ' +
      fallbackCount +
      ')',
  );
  console.log('[seed] organizer@elite.dev / senha123 (ORGANIZER)');
  console.log('[seed] cliente1@elite.dev / senha123 (CLIENT, possui 2 ingressos)');
  console.log('[seed] cliente2@elite.dev / senha123 (CLIENT)');
  console.log('[seed] portaria@elite.dev / senha123 (GATE)');
  console.log(
    '[seed] usuários prontos: ' +
      [organizer.email, client1.email, client2.email, gate.email].join(', '),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
