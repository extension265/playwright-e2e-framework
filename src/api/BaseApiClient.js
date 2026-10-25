import { assertSchema } from './schemas/schemaValidator.js';

/**
 * Thin wrapper over Playwright's APIRequestContext. Every call returns
 * `{ status, body, response }` so tests can assert on status codes directly,
 * including the error paths. When a schema is given and the response is
 * successful, the body is validated before it reaches the test.
 */
export class BaseApiClient {
  /** @param {import('@playwright/test').APIRequestContext} request */
  constructor(request) {
    this.request = request;
  }

  async send(method, url, { data, headers, schema } = {}) {
    const response = await this.request.fetch(url, { method, data, headers });
    const body = await parseBody(response);
    if (schema && response.ok()) assertSchema(schema, body, `${method} ${url}`);
    return { status: response.status(), body, response };
  }
}

async function parseBody(response) {
  const contentType = response.headers()['content-type'] ?? '';
  return contentType.includes('application/json') ? response.json() : response.text();
}
