import assert from 'node:assert/strict';
import test from 'node:test';
import { runPhase4Integration } from './run-phase4-integration.mjs';

const env = {
  CONTROL_DATABASE_URL: 'fake',
  POSTGRES_ADMIN_URL: 'fake',
  INTERNAL_SERVICE_TOKEN: 'fake',
  DEMO_USER_PASSWORD: 'fake',
  BRANCH_DB_ENCRYPTION_KEY: 'fake',
  npm_execpath: 'C:\\npm\\npm-cli.js',
};

test('uses node with npm-cli.js on Windows and constant arguments', () => {
  const calls = [];
  runPhase4Integration({
    platform: 'win32', env,
    spawn(command, args, options) {
      calls.push({ command, args, options });
      return { status: 0, signal: null };
    },
  });
  assert.equal(calls.length, 3);
  assert.equal(calls[1].command, process.execPath);
  assert.deepEqual(calls[1].args, [env.npm_execpath, '--prefix', 'core-service', 'run', 'branches:test:integration']);
  assert.equal(calls[1].options.shell, false);
});

test('uses npm directly on Linux', () => {
  const calls = [];
  runPhase4Integration({ platform: 'linux', env, spawn(command, args) { calls.push({ command, args }); return { status: 0, signal: null }; } });
  assert.equal(calls[1].command, 'npm');
});

test('reports spawn error, signal and non-zero status', () => {
  assert.throws(() => runPhase4Integration({ env, spawn: () => ({ error: new Error('missing') }) }), /could not start/);
  assert.throws(() => runPhase4Integration({ env, spawn: () => ({ status: null, signal: 'SIGTERM' }) }), /SIGTERM/);
  assert.throws(() => runPhase4Integration({ env, spawn: () => ({ status: 2, signal: null }) }), /status 2/);
});
