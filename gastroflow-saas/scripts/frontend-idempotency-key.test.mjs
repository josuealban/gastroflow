import assert from 'node:assert/strict';
import test from 'node:test';
import { createIdempotencyKeyController } from '../frontend/src/branches/idempotency-key.js';

function controller() {
  let sequence = 0;
  return createIdempotencyKeyController(() => `key-${++sequence}`);
}
for (const [name, error] of [
  ['network error without response', new Error('network')],
  ['HTTP 408', { response: { status: 408 } }],
  ['HTTP 425', { response: { status: 425 } }],
  ['HTTP 500', { response: { status: 500 } }],
  ['HTTP 502', { response: { status: 502 } }],
  ['HTTP 503', { response: { status: 503 } }],
  ['HTTP 504', { response: { status: 504 } }],
]) test(`${name} keeps the same key`, () => {
  const state = controller();
  assert.equal(state.getOrCreate(), 'key-1');
  state.onError(error);
  assert.equal(state.peek(), 'key-1');
  assert.equal(state.getOrCreate(), 'key-1');
});

for (const status of [400, 409]) test(`HTTP ${status} clears the key`, () => {
  const state = controller(); state.getOrCreate();
  state.onError({ response: { status } });
  assert.equal(state.peek(), null);
});

test('confirmed success clears the key', () => {
  const state = controller(); state.getOrCreate(); state.onSuccess();
  assert.equal(state.peek(), null);
});

test('explicit cancellation clears the key', () => {
  const state = controller(); state.getOrCreate(); state.cancel();
  assert.equal(state.peek(), null);
});
