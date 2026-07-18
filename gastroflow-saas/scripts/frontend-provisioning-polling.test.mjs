import assert from 'node:assert/strict';
import test from 'node:test';
import { pollBranchProvisioning } from '../frontend/src/branches/provisioning-polling.js';

test('polls branch progress endpoint data and stops at ACTIVE', async () => {
  const seen = [], queue = [];
  let calls = 0;
  pollBranchProvisioning({
    branchId: 'branch-1',
    fetchProgress: async (id) => ({ branchId: id, branchStatus: ++calls === 2 ? 'ACTIVE' : 'PROVISIONING', jobStatus: calls === 2 ? 'COMPLETED' : 'PROCESSING', attempts: calls, maxAttempts: 3 }),
    onProgress: (value) => seen.push(value), onError: assert.fail,
    schedule: (callback) => { queue.push(callback); return 1; },
  });
  await new Promise(setImmediate);
  assert.equal(queue.length, 1);
  queue.shift()();
  await new Promise(setImmediate);
  assert.equal(calls, 2);
  assert.equal(seen.at(-1).branchStatus, 'ACTIVE');
  assert.equal(queue.length, 0);
});

test('stops after the configured maximum', async () => {
  const queue = []; let calls = 0;
  pollBranchProvisioning({ branchId: 'branch-2', fetchProgress: async () => ({ branchId: 'branch-2', branchStatus: 'PROVISIONING', jobStatus: 'PENDING', attempts: 0, maxAttempts: 3 }), onProgress: () => { calls += 1; }, onError: assert.fail, maxPolls: 2, schedule: (callback) => { queue.push(callback); return 1; } });
  await new Promise(setImmediate); queue.shift()(); await new Promise(setImmediate);
  assert.equal(calls, 2); assert.equal(queue.length, 0);
});
