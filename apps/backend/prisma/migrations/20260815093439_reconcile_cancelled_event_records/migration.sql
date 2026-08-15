-- Reconcile records from events cancelled before refund tracking existed.
UPDATE "Order" AS orders
SET "status" = 'REFUND_REQUESTED'
FROM "Event" AS events
WHERE orders."eventId" = events."id"
  AND events."status" = 'CANCELLED'
  AND orders."status" = 'PAID';

UPDATE "Ticket" AS tickets
SET "status" = 'EVENT_CANCELLED'
FROM "Event" AS events
WHERE tickets."eventId" = events."id"
  AND events."status" = 'CANCELLED';

DELETE FROM "ReservationSeat" AS reservation_seats
USING "Reservation" AS reservations, "Event" AS events
WHERE reservation_seats."reservationId" = reservations."id"
  AND reservations."eventId" = events."id"
  AND events."status" = 'CANCELLED'
  AND reservations."status" = 'HELD';

UPDATE "Reservation" AS reservations
SET "status" = 'RELEASED'
FROM "Event" AS events
WHERE reservations."eventId" = events."id"
  AND events."status" = 'CANCELLED'
  AND reservations."status" = 'HELD';
