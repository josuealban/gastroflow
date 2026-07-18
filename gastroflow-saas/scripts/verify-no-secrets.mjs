import { execFileSync } from 'node:child_process';

function git(...args) {
  return execFileSync('git', ['-c', 'safe.directory=*', ...args], { encoding: 'utf8' });
}

const staged = git('diff', '--cached', '--name-only').split(/\r?\n/).filter(Boolean);
const forbiddenEnv = staged.filter((name) => /(^|\/)\.env(?:\.|$)/.test(name) && !name.endsWith('.env.example'));
if (forbiddenEnv.length) throw new Error(`Forbidden environment files staged: ${forbiddenEnv.join(', ')}`);

const diff = `${git('diff', '--no-ext-diff', '-U0')}\n${git('diff', '--cached', '--no-ext-diff', '-U0')}`;
const added = diff.split(/\r?\n/).filter((line) => line.startsWith('+') && !line.startsWith('+++')).join('\n');
const findings = [
  ['JWT', /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/],
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
].filter(([, pattern]) => pattern.test(added));
if (findings.length) throw new Error(`Potential secrets found in diff: ${findings.map(([name]) => name).join(', ')}`);
console.log('Secret check passed: no staged .env files or token/key patterns found.');
