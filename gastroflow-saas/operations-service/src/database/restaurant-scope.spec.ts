import { restaurantScope } from './restaurant-scope';

describe('restaurantScope', () => {
  it('forces an explicit restaurantId filter', () => {
    const restaurantId = '10000000-0000-4000-8000-000000000002';
    expect(restaurantScope(restaurantId)).toEqual({ restaurantId });
  });

  it('rejects arbitrary tenant input', () => {
    expect(() => restaurantScope('restaurant-selected-by-client')).toThrow(
      'restaurantId interno inválido',
    );
  });
});
