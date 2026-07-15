import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.POSTGRES_ADMIN_URL;
if (!connectionString) throw new Error('POSTGRES_ADMIN_URL is required');

async function main(): Promise<void> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const client = new pg.Client({ connectionString });
    try {
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log('PostgreSQL is healthy');
      return;
    } catch {
      await client.end().catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('PostgreSQL did not become healthy within 60 seconds');
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'PostgreSQL health check failed',
  );
  process.exitCode = 1;
});
