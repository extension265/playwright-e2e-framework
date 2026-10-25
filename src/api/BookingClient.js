import { BaseApiClient } from './BaseApiClient.js';
import { bookingSchema, createBookingResponseSchema } from './schemas/booking.schemas.js';

export class BookingClient extends BaseApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   * @param {string} [token] admin token; required for update and delete
   */
  constructor(request, token) {
    super(request);
    this.token = token;
  }

  create(booking) {
    return this.send('POST', '/booking', { data: booking, schema: createBookingResponseSchema });
  }

  get(id) {
    return this.send('GET', `/booking/${id}`, { schema: bookingSchema });
  }

  update(id, booking, { authenticated = true } = {}) {
    return this.send('PUT', `/booking/${id}`, {
      data: booking,
      headers: this.#auth(authenticated),
      schema: bookingSchema,
    });
  }

  partialUpdate(id, fields) {
    return this.send('PATCH', `/booking/${id}`, { data: fields, headers: this.#auth(true), schema: bookingSchema });
  }

  delete(id) {
    return this.send('DELETE', `/booking/${id}`, { headers: this.#auth(true) });
  }

  #auth(authenticated) {
    if (!authenticated) return {};
    if (!this.token) throw new Error('BookingClient needs a token for this call.');
    return { Cookie: `token=${this.token}` };
  }
}
