const ascending = (a, b) => (a > b) - (a < b);
const descending = (a, b) => ascending(b, a);

/** Each case: which sort option to pick, which column to read, and the expected order. */
export const sortCases = [
  { label: 'name Z → A', option: 'za', read: 'names', compare: descending },
  { label: 'price low → high', option: 'lohi', read: 'prices', compare: ascending },
];

export const PRODUCTS = Object.freeze({
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltShirt: 'Sauce Labs Bolt T-Shirt',
});
