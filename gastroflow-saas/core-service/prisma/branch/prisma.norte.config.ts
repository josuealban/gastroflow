import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  migrations: {
    path: './migrations',
    seed: 'tsx prisma/branch/seed.ts norte',
  },
  datasource: {
    url:
      process.env.DEMO_NORTE_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/gastroflow_demo_norte?schema=public',
  },
});
