import { parseHost, parsePort } from './configuration';

describe('Core runtime configuration', () => {
  it('uses local defaults', () => {
    expect(parseHost(undefined, '127.0.0.1', 'CORE_SERVICE_HOST')).toBe(
      '127.0.0.1',
    );
    expect(parsePort(undefined, 3001, 'CORE_SERVICE_PORT')).toBe(3001);
  });

  it.each(['0', '-1', '65536', 'abc', '3.14'])(
    'rejects invalid port %s',
    (value) => {
      expect(() => parsePort(value, 3001, 'CORE_SERVICE_PORT')).toThrow(
        'CORE_SERVICE_PORT',
      );
    },
  );

  it('rejects invalid hosts', () => {
    expect(() =>
      parseHost('bad host', '127.0.0.1', 'CORE_SERVICE_HOST'),
    ).toThrow('CORE_SERVICE_HOST');
  });
});
