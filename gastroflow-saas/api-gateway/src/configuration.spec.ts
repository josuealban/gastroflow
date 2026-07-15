import {
  parseCorsOrigins,
  parseHost,
  parsePort,
  parseTimeout,
} from './configuration';

describe('runtime configuration', () => {
  it('uses validated local defaults', () => {
    expect(parsePort(undefined, 3000)).toBe(3000);
    expect(parseHost(undefined, '127.0.0.1', 'HOST')).toBe('127.0.0.1');
    expect(parseTimeout(undefined, 3000)).toBe(3000);
    expect(parseCorsOrigins(undefined, 'http://localhost:5173')).toEqual([
      'http://localhost:5173',
    ]);
  });

  it.each(['0', '-1', '65536', 'abc', '3.14'])(
    'rejects invalid port %s',
    (value) => {
      expect(() => parsePort(value, 3000)).toThrow('puerto entero');
    },
  );

  it('rejects invalid hosts, timeouts and CORS origins', () => {
    expect(() => parseHost('bad host', 'localhost', 'HOST')).toThrow(
      'host inválido',
    );
    expect(() => parseTimeout('0', 3000)).toThrow('MICROSERVICE_TIMEOUT_MS');
    expect(() => parseCorsOrigins('file:///tmp', 'http://localhost')).toThrow(
      'HTTP(S)',
    );
  });
});
