import 'server-only';

import { getEventById, getSeats } from '@/features/events/queries';

export async function getEventForCheckout(eventId: string) {
  const [event, seats] = await Promise.all([getEventById(eventId), getSeats(eventId)]);

  if (!event) {
    return null;
  }

  return { event, seats };
}
