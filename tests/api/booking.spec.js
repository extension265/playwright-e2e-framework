import { test, expect } from '../../src/fixtures/index.js';
import { buildBooking } from '../../src/data/bookingBuilder.js';

// Response bodies are schema-validated inside BookingClient; these tests
// assert behaviour. Restful Booker quirks asserted here on purpose:
//   DELETE → 201 "Created"     unauthenticated write → 403 "Forbidden" (text/plain)
test.describe('Bookings API', { tag: '@api' }, () => {
  test('creates a booking and returns it with an id', { tag: '@smoke' }, async ({ bookingApi }) => {
    const payload = buildBooking();

    const { status, body } = await bookingApi.create(payload);

    expect(status).toBe(200);
    expect(body.booking).toEqual(payload);

    await bookingApi.delete(body.bookingid); // this test owns the booking, so it cleans up
  });

  test('retrieves a booking by id', { tag: '@smoke' }, async ({ bookingApi, booking }) => {
    const { status, body } = await bookingApi.get(booking.id);

    expect(status).toBe(200);
    expect(body).toEqual(booking.data);
  });

  test('replaces a booking with PUT', { tag: '@regression' }, async ({ bookingApi, booking }) => {
    const replacement = buildBooking({ additionalneeds: 'Sea view' });

    const { status, body } = await bookingApi.update(booking.id, replacement);

    expect(status).toBe(200);
    expect(body).toEqual(replacement);
    expect((await bookingApi.get(booking.id)).body).toEqual(replacement);
  });

  test('updates selected fields with PATCH', { tag: '@regression' }, async ({ bookingApi, booking }) => {
    const { status, body } = await bookingApi.partialUpdate(booking.id, { totalprice: 999, depositpaid: true });

    expect(status).toBe(200);
    expect(body).toEqual({ ...booking.data, totalprice: 999, depositpaid: true });
  });

  test(
    'deletes a booking (API answers 201, then 404 on read)',
    { tag: '@regression' },
    async ({ bookingApi, booking }) => {
      const deleted = await bookingApi.delete(booking.id);
      expect(deleted.status).toBe(201);
      expect(deleted.body).toBe('Created');

      const read = await bookingApi.get(booking.id);
      expect(read.status).toBe(404);
      expect(read.body).toBe('Not Found');
    },
  );

  test('rejects an update without a token', { tag: '@regression' }, async ({ bookingApi, booking }) => {
    const { status, body } = await bookingApi.update(booking.id, buildBooking(), { authenticated: false });

    expect(status).toBe(403);
    expect(body).toBe('Forbidden');
    expect((await bookingApi.get(booking.id)).body).toEqual(booking.data); // unchanged
  });
});
