const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface RestaurantScope {
  restaurantId: string;
}

export function restaurantScope(restaurantId: string): RestaurantScope {
  if (!UUID_PATTERN.test(restaurantId)) {
    throw new Error('restaurantId interno inválido');
  }
  return { restaurantId };
}
