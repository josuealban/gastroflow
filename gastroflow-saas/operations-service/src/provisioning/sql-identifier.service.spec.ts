import { SqlIdentifierService } from './sql-identifier.service';
describe('SqlIdentifierService', () => {
  const service = new SqlIdentifierService();
  it('accepts and quotes safe identifiers', () =>
    expect(service.quote('gf_branch_123')).toBe('"gf_branch_123"'));
  it.each([
    'x',
    'has-dash',
    'has space',
    'x;drop',
    'x"quote',
    'x.comment',
    'á_unicode',
  ])('rejects unsafe identifier %s', (value) =>
    expect(() => service.validate(value)).toThrow(),
  );
});
