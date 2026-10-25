import { PERSONAS } from './users.js';

/**
 * Negative login cases. Built from the valid credentials so the cases stay
 * correct in any environment without duplicating secrets.
 * @param {{ username: string, password: string }} valid
 */
export const loginFailureCases = (valid) => [
  {
    name: 'locked-out user',
    credentials: { username: PERSONAS.lockedOut, password: valid.password },
    error: 'Epic sadface: Sorry, this user has been locked out.',
  },
  {
    name: 'wrong password',
    credentials: { username: valid.username, password: `${valid.password}-wrong` },
    error: 'Epic sadface: Username and password do not match any user in this service',
  },
  {
    name: 'missing username',
    credentials: { username: '', password: valid.password },
    error: 'Epic sadface: Username is required',
  },
  {
    name: 'missing password',
    credentials: { username: valid.username, password: '' },
    error: 'Epic sadface: Password is required',
  },
];
