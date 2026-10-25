import { test, expect } from '../../src/fixtures/index.js';

test.describe('Auth API', { tag: '@api' }, () => {
  // Restful Booker quirk: failed auth is HTTP 200 with a "reason" body, not 401.
  // Asserting the status alone would wrongly pass, so the body is checked too.
  test('bad credentials return 200 with "Bad credentials"', { tag: '@regression' }, async ({ authApi }) => {
    const { status, body } = await authApi.createToken({ username: 'not-a-user', password: 'not-a-password' }); // gitleaks:allow — intentionally invalid

    expect(status).toBe(200);
    expect(body).toEqual({ reason: 'Bad credentials' });
    expect(body).not.toHaveProperty('token');
  });
});
