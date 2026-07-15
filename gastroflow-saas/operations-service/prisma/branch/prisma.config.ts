import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  migrations: {
    path: './migrations',
  },
  datasource: {
    url:
      process.env.BRANCH_DATABASE_URL ??
      process.env.DEMO_PRINCIPAL_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/gastroflow_demo_principal?schema=public',
  },
});
