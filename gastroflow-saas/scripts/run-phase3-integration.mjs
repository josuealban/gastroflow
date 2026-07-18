import { spawnSync } from 'node:child_process';

const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
const args = process.platform === 'win32'
  ? ['/d', '/s', '/c', 'npm.cmd --prefix core-service run test:integration']
  : ['--prefix', 'core-service', 'run', 'test:integration'];
const result = spawnSync(command, args, {
  stdio: 'inherit',
  env: { ...process.env, RUN_DATABASE_TESTS: 'true' },
});
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
