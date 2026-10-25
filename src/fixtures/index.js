import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { env } from '../../config/env.js';
import { PageManager } from '../pages/PageManager.js';
import { AuthClient } from '../api/AuthClient.js';
import { BookingClient } from '../api/BookingClient.js';
import { buildBooking } from '../data/bookingBuilder.js';
import { dataStore } from '../utils/dataStore.js';

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Custom fixtures: tests declare what they need and get it ready-made,
 * with setup and teardown kept out of the test body.
 */
export const test = base.extend({
  // ── UI ─────────────────────────────────────────────────────────────────────
  pages: async ({ page }, use) => {
    await use(new PageManager(page));
  },

  /** Returns a factory so each test can narrow the scan (e.g. `.include(...)`). */
  makeAxeBuilder: async ({ page }, use) => {
    await use(() => new AxeBuilder({ page }).withTags(WCAG_TAGS));
  },

  // ── API ────────────────────────────────────────────────────────────────────
  /** One request context per worker, shared by all API tests in that worker. */
  apiRequest: [
    async ({ playwright }, use) => {
      const context = await playwright.request.newContext({
        baseURL: env.apiBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  authApi: async ({ apiRequest }, use) => {
    await use(new AuthClient(apiRequest));
  },

  /** Booking client pre-authorised with the token written by the setup-api project. */
  bookingApi: async ({ apiRequest }, use) => {
    await use(new BookingClient(apiRequest, dataStore.get('apiToken')));
  },

  /** A booking created for this test only, and deleted afterwards. */
  booking: async ({ bookingApi }, use) => {
    const { status, body } = await bookingApi.create(buildBooking());
    expect(status, 'fixture: create booking').toBe(200);
    await use({ id: body.bookingid, data: body.booking });
    // Teardown: tolerate tests that already deleted it (API answers 405 then).
    await bookingApi.delete(body.bookingid);
  },
});

export { expect };
