import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const docker = spawnSync('docker', ['--version'], { stdio: 'ignore' });
if (docker.error || docker.status !== 0) {
  console.error('Phase 4 integration not executed: Docker is unavailable.');
  process.exit(1);
}

const required = [
  'CONTROL_DATABASE_URL',
  'POSTGRES_ADMIN_URL',
  'INTERNAL_SERVICE_TOKEN',
  'DEMO_USER_PASSWORD',
  'BRANCH_DB_ENCRYPTION_KEY',
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Phase 4 integration not executed: missing ${missing.join(', ')}.`);
  process.exit(1);
}

for (const args of [
  ['--prefix', 'core-service', 'run', 'branches:test:integration'],
  ['--prefix', 'operations-service', 'run', 'provisioning:test:integration'],
]) {
  const result = spawnSync(npm, args, {
    stdio: 'inherit',
    env: { ...process.env, RUN_DATABASE_TESTS: 'true' },
    shell: false,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
