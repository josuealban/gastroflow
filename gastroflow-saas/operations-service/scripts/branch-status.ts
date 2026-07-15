/**
 * branch-status.ts
 * Script de utilidad: muestra el estado de las sucursales en gastroflow_control.
 * Requiere CONTROL_DATABASE_URL en el .env de core-service o como variable de entorno.
 * Ejecutar con: npm run branches:status (desde la raíz del proyecto)
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../core-service/src/generated/control-client/client';

const url = process.env.CONTROL_DATABASE_URL;
if (!url) {
  console.error('CONTROL_DATABASE_URL is required');
  process.exitCode = 1;
  process.exit();
}

async function main(): Promise<void> {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url! }),
  });
  try {
    const branches = await prisma.branch.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        databaseName: true,
        restaurant: { select: { name: true, isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.table(
      branches.map((b) => ({
        id: b.id,
        branch: b.name,
        status: b.status,
        database: b.databaseName,
        restaurant: b.restaurant.name,
        restaurantActive: b.restaurant.isActive,
      })),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
