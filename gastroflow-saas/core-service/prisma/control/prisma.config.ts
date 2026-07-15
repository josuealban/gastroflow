import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  migrations: {
    path: './migrations',
    seed: 'tsx prisma/control/seed.ts',
  },
  datasource: {
    url:
      process.env.CONTROL_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/gastroflow_control?schema=public',
  },
});
