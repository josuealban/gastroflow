import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './auth.dto';

describe('LoginDto', () => {
  it('normalizes restaurant slug and email before validation', async () => {
    const dto = plainToInstance(LoginDto, {
      restaurantSlug: ' Restaurante-Demo ',
      email: ' OWNER@GASTROFLOW.COM ',
      password: 'secret',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.restaurantSlug).toBe('restaurante-demo');
    expect(dto.email).toBe('owner@gastroflow.com');
  });
});
