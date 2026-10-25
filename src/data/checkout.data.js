import { faker } from '@faker-js/faker';

/** A fresh, realistic customer per call — no two runs share data. */
export function buildCustomer(overrides = {}) {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode('#####'),
    ...overrides,
  };
}

export const checkoutValidationCases = [
  { missing: 'first name', overrides: { firstName: '' }, error: 'Error: First Name is required' },
  { missing: 'postal code', overrides: { postalCode: '' }, error: 'Error: Postal Code is required' },
];

export const TAX_RATE = 0.08;
