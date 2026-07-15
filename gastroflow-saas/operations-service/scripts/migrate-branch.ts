import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { getBranchUrl, type DemoBranchTarget } from './script-utils';

const target = process.argv[2] as DemoBranchTarget;
const mode = process.argv[3];
if (
  !['principal', 'norte'].includes(target) ||
  !['dev', 'deploy'].includes(mode)
) {
  console.error('Usage: migrate-branch <principal|norte> <dev|deploy>');
  process.exit(2);
}

const cli = path.resolve('node_modules/prisma/build/index.js');
const args =
  mode === 'dev'
    ? [
        'migrate',
        'dev',
        '--name',
        'branch_init',
        '--config',
        'prisma/branch/prisma.config.ts',
      ]
    : ['migrate', 'deploy', '--config', 'prisma/branch/prisma.config.ts'];
const result = spawnSync(process.execPath, [cli, ...args], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: { ...process.env, BRANCH_DATABASE_URL: getBranchUrl(target) },
});
process.exit(result.status ?? 1);
