import { OrganizerDashboard } from '@/features/events/components/organizer-dashboard';
import { listMyEvents } from '@/features/events/queries';
import { getSession } from '@/shared/session/get-session';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [session, events] = await Promise.all([getSession(), listMyEvents({ pageSize: 100 })]);

  return (
    <OrganizerDashboard
      organizerName={session?.user.name ?? 'organizador'}
      events={events.items}
      total={events.total}
    />
  );
}
