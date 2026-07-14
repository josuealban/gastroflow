import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  migrations: {
    path: './migrations',
    seed: 'tsx prisma/personal/seed.ts',
  },
  datasource: {
    url:
      process.env.PERSONAL_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/gastroflow_personal?schema=public',
  },
});
