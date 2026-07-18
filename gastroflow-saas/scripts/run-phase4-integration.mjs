import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function assertSpawn(result, label) {
  if (result.error) throw new Error(`${label} could not start: ${result.error.message}`);
  if (result.signal) throw new Error(`${label} terminated by signal ${result.signal}`);
  if (result.status !== 0) throw new Error(`${label} exited with status ${result.status ?? 'unknown'}`);
}

export function runPhase4Integration({
  platform = process.platform,
  env = process.env,
  spawn = spawnSync,
} = {}) {
  assertSpawn(spawn('docker', ['--version'], { stdio: 'ignore' }), 'Docker preflight');
  const required = [
    'CONTROL_DATABASE_URL',
    'POSTGRES_ADMIN_URL',
    'INTERNAL_SERVICE_TOKEN',
    'DEMO_USER_PASSWORD',
    'BRANCH_DB_ENCRYPTION_KEY',
  ];
  const missing = required.filter((name) => !env[name]);
  if (missing.length) throw new Error(`Missing integration variables: ${missing.join(', ')}`);

  const suites = [
    ['--prefix', 'core-service', 'run', 'branches:test:integration'],
    ['--prefix', 'operations-service', 'run', 'provisioning:test:integration'],
  ];
  const childEnv = { ...env, RUN_DATABASE_TESTS: 'true' };
  for (const args of suites) {
    if (platform === 'win32') {
      const npmCli = env.npm_execpath || resolve(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
      assertSpawn(
        spawn(process.execPath, [npmCli, ...args], { stdio: 'inherit', env: childEnv, shell: false }),
        `npm ${args.join(' ')}`,
      );
    } else {
      assertSpawn(
        spawn('npm', args, { stdio: 'inherit', env: childEnv, shell: false }),
        `npm ${args.join(' ')}`,
      );
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runPhase4Integration();
  } catch (error) {
    console.error(`Phase 4 integration not executed: ${error instanceof Error ? error.message : 'unknown error'}.`);
    process.exitCode = 1;
  }
}
