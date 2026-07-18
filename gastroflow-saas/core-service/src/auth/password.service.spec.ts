import { ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';
describe('PasswordService', () => {
  it('hashes and compares without retaining plaintext', async () => {
    const s = new PasswordService(new ConfigService({ BCRYPT_ROUNDS: '10' }));
    const hash = await s.hash('Secret123!');
    expect(hash).not.toBe('Secret123!');
    await expect(s.compare('Secret123!', hash)).resolves.toBe(true);
    await expect(s.compare('wrong', hash)).resolves.toBe(false);
  });
  it('rejects weak rounds', () =>
    expect(
      () => new PasswordService(new ConfigService({ BCRYPT_ROUNDS: '9' })),
    ).toThrow());
});
