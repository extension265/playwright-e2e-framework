import { BaseApiClient } from './BaseApiClient.js';
import { authResponseSchema } from './schemas/booking.schemas.js';

export class AuthClient extends BaseApiClient {
  /** POST /auth — returns 200 even for bad credentials; check `body.token` vs `body.reason`. */
  createToken({ username, password }) {
    return this.send('POST', '/auth', { data: { username, password }, schema: authResponseSchema });
  }
}
