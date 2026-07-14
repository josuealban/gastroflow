import { restaurantScope } from './restaurant-scope';

describe('restaurantScope', () => {
  it('returns an explicit tenant filter', () => {
    const restaurantId = '10000000-0000-4000-8000-000000000001';
    expect(restaurantScope(restaurantId)).toEqual({ restaurantId });
  });

  it('rejects an invalid restaurantId', () => {
    expect(() => restaurantScope('from-frontend')).toThrow(
      'restaurantId interno inválido',
    );
  });
});
