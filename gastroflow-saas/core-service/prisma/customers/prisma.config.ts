import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  migrations: {
    path: './migrations',
    seed: 'tsx prisma/customers/seed.ts',
  },
  datasource: {
    url:
      process.env.CUSTOMERS_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/gastroflow_clientes?schema=public',
  },
});
