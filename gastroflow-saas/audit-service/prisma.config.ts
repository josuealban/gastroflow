import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url:
      process.env.AUDIT_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/gastroflow_audit?schema=public',
  },
});
