import { registerSchemas } from './schemaValidator.js';

// JSON Schemas for the booking API. `additionalProperties: false` makes
// unannounced contract changes (new or renamed fields) fail loudly.

export const bookingSchema = {
  $id: 'booking',
  title: 'Booking',
  type: 'object',
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  additionalProperties: false,
  properties: {
    firstname: { type: 'string', minLength: 1 },
    lastname: { type: 'string', minLength: 1 },
    totalprice: { type: 'integer', minimum: 0 },
    depositpaid: { type: 'boolean' },
    bookingdates: {
      type: 'object',
      required: ['checkin', 'checkout'],
      additionalProperties: false,
      properties: {
        checkin: { type: 'string', format: 'date' },
        checkout: { type: 'string', format: 'date' },
      },
    },
    additionalneeds: { type: 'string' },
  },
};

export const createBookingResponseSchema = {
  $id: 'createBookingResponse',
  title: 'CreateBookingResponse',
  type: 'object',
  required: ['bookingid', 'booking'],
  additionalProperties: false,
  properties: {
    bookingid: { type: 'integer', minimum: 1 },
    booking: { $ref: 'booking' },
  },
};

// POST /auth answers 200 for both outcomes — only the body shape differs.
export const authResponseSchema = {
  $id: 'authResponse',
  title: 'AuthResponse',
  type: 'object',
  oneOf: [
    { required: ['token'], properties: { token: { type: 'string', minLength: 1 } }, additionalProperties: false },
    { required: ['reason'], properties: { reason: { type: 'string' } }, additionalProperties: false },
  ],
};

registerSchemas(bookingSchema, createBookingResponseSchema, authResponseSchema);
