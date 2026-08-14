import { Role } from '@app/shared';

export function homeByRole(role: Role): string {
  switch (role) {
    case Role.ORGANIZER:
      return '/dashboard';
    case Role.CLIENT:
      return '/events';
    case Role.GATE:
      return '/validate';
  }
}
