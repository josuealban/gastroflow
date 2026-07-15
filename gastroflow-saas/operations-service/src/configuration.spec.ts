import { parseHost, parsePort } from './configuration';

describe('Operations runtime configuration', () => {
  it('uses local defaults', () => {
    expect(parseHost(undefined, '127.0.0.1', 'OPERATIONS_SERVICE_HOST')).toBe(
      '127.0.0.1',
    );
    expect(parsePort(undefined, 3002, 'OPERATIONS_SERVICE_PORT')).toBe(3002);
  });

  it.each(['0', '-1', '65536', 'abc', '3.14'])(
    'rejects invalid port %s',
    (value) => {
      expect(() => parsePort(value, 3002, 'OPERATIONS_SERVICE_PORT')).toThrow(
        'OPERATIONS_SERVICE_PORT',
      );
    },
  );

  it('rejects invalid hosts', () => {
    expect(() =>
      parseHost('bad host', '127.0.0.1', 'OPERATIONS_SERVICE_HOST'),
    ).toThrow('OPERATIONS_SERVICE_HOST');
  });
});
