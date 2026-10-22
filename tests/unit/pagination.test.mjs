import test from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from 'b5-decomp-webui';

test('package can be imported without a DOM, and pagination does not mutate data', () => {
  const data = Object.freeze(['a', 'b', 'c', 'd', 'e']);
  assert.deepEqual(paginate(data, { page: 2, pageSize: 2 }), {
    items: ['c', 'd'], page: 2, pageCount: 3, total: 5, from: 3, to: 4,
    hasPrevious: true, hasNext: true
  });
  assert.deepEqual(data, ['a', 'b', 'c', 'd', 'e']);
});
test('pages clamp after a filter shrinks the collection', () => {
  const last = paginate([1, 2, 3], { page: 99, pageSize: 2 });
  assert.equal(last.page, 2);
  assert.deepEqual(last.items, [3]);
  assert.equal(last.to, 3);
  assert.equal(last.hasNext, false);
  assert.equal(paginate([1], { page: -2 }).page, 1);
});
test('empty collections have an explicit empty range', () => {
  assert.deepEqual(paginate([], { page: 5 }), {
    items: [], page: 1, pageCount: 1, total: 0, from: 0, to: 0,
    hasPrevious: false, hasNext: false
  });
});
test('invalid page sizes and noninteger pages fail early', () => {
  for (const pageSize of [0, -1, 1.2, NaN, Infinity]) assert.throws(() => paginate([], { pageSize }), RangeError);
  for (const page of [NaN, Infinity, 1.2]) assert.throws(() => paginate([], { page }), RangeError);
  assert.throws(() => paginate({ length: 5 }), TypeError);
});
