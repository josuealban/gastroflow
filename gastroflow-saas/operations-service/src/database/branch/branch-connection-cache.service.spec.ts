import { BranchConnectionCacheService } from './branch-connection-cache.service';

function client() {
  return { $disconnect: jest.fn().mockResolvedValue(undefined) };
}

describe('BranchConnectionCacheService', () => {
  it('reuses a client for the same branch and separates branch IDs', () => {
    const cache = new BranchConnectionCacheService();
    const principal = client();
    const norte = client();
    cache.set('principal', principal as never);
    cache.set('norte', norte as never);
    expect(cache.get('principal')).toBe(principal);
    expect(cache.get('norte')).toBe(norte);
    expect(cache.size()).toBe(2);
  });

  it('evicts and disconnects a defective client', async () => {
    const cache = new BranchConnectionCacheService();
    const defective = client();
    cache.set('branch', defective as never);
    await cache.remove('branch');
    expect(cache.get('branch')).toBeUndefined();
    expect(defective.$disconnect).toHaveBeenCalledTimes(1);
  });

  it('disconnects every cached client on shutdown', async () => {
    const cache = new BranchConnectionCacheService();
    const one = client();
    const two = client();
    cache.set('one', one as never);
    cache.set('two', two as never);
    await cache.onModuleDestroy();
    expect(one.$disconnect).toHaveBeenCalled();
    expect(two.$disconnect).toHaveBeenCalled();
    expect(cache.size()).toBe(0);
  });
});
