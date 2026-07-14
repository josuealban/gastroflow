import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  ReservationStatus,
} from '../../src/generated/customers-client/client';

const connectionString = process.env.CUSTOMERS_DATABASE_URL;
if (!connectionString) {
  throw new Error('CUSTOMERS_DATABASE_URL es obligatoria para el seed');
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const DEMO_RESTAURANT_ID = '10000000-0000-4000-8000-000000000001';
const TEST_RESTAURANT_ID = '10000000-0000-4000-8000-000000000002';

async function main(): Promise<void> {
  const demoCustomers = [
    [
      '30000000-0000-4000-8000-000000000001',
      'Ana Torres',
      '0911111111',
      '0991111111',
      'ana@example.com',
    ],
    [
      '30000000-0000-4000-8000-000000000002',
      'Carlos Ruiz',
      '0922222222',
      '0992222222',
      'carlos@example.com',
    ],
    [
      '30000000-0000-4000-8000-000000000003',
      'María Paz',
      '0933333333',
      '0993333333',
      'maria@example.com',
    ],
    [
      '30000000-0000-4000-8000-000000000004',
      'José León',
      '0944444444',
      '0994444444',
      'jose@example.com',
    ],
    [
      '30000000-0000-4000-8000-000000000005',
      'Elena Mora',
      '0955555555',
      '0995555555',
      'elena@example.com',
    ],
  ] as const;
  for (const [id, name, identification, phone, email] of demoCustomers) {
    await prisma.customer.upsert({
      where: { id },
      update: { name, identification, phone, email, isActive: true },
      create: {
        id,
        restaurantId: DEMO_RESTAURANT_ID,
        name,
        identification,
        phone,
        email,
      },
    });
  }

  const testCustomers = [
    [
      '30000000-0000-4000-8000-000000000101',
      'Cliente Prueba Uno',
      '0966666666',
    ],
    [
      '30000000-0000-4000-8000-000000000102',
      'Cliente Prueba Dos',
      '0977777777',
    ],
  ] as const;
  for (const [id, name, identification] of testCustomers) {
    await prisma.customer.upsert({
      where: { id },
      update: { name, identification, isActive: true },
      create: { id, restaurantId: TEST_RESTAURANT_ID, name, identification },
    });
  }

  await prisma.reservation.upsert({
    where: { id: '31000000-0000-4000-8000-000000000001' },
    update: { status: ReservationStatus.CONFIRMED },
    create: {
      id: '31000000-0000-4000-8000-000000000001',
      restaurantId: DEMO_RESTAURANT_ID,
      customerId: demoCustomers[0][0],
      tableId: '50000000-0000-4000-8000-000000000001',
      reservationDate: new Date('2026-08-01T19:00:00.000Z'),
      numberOfGuests: 4,
      status: ReservationStatus.CONFIRMED,
    },
  });
  await prisma.reservation.upsert({
    where: { id: '31000000-0000-4000-8000-000000000002' },
    update: { status: ReservationStatus.PENDING },
    create: {
      id: '31000000-0000-4000-8000-000000000002',
      restaurantId: DEMO_RESTAURANT_ID,
      customerId: demoCustomers[1][0],
      tableId: '50000000-0000-4000-8000-000000000002',
      reservationDate: new Date('2026-08-02T20:00:00.000Z'),
      numberOfGuests: 2,
      status: ReservationStatus.PENDING,
    },
  });
  await prisma.customerNote.upsert({
    where: { id: '32000000-0000-4000-8000-000000000001' },
    update: { content: 'Prefiere una mesa tranquila.' },
    create: {
      id: '32000000-0000-4000-8000-000000000001',
      restaurantId: DEMO_RESTAURANT_ID,
      customerId: demoCustomers[0][0],
      createdByUserId: '20000000-0000-4000-8000-000000000002',
      content: 'Prefiere una mesa tranquila.',
    },
  });
  await prisma.customerPreference.upsert({
    where: { id: '33000000-0000-4000-8000-000000000001' },
    update: { description: 'Sin bebidas azucaradas.' },
    create: {
      id: '33000000-0000-4000-8000-000000000001',
      restaurantId: DEMO_RESTAURANT_ID,
      customerId: demoCustomers[0][0],
      description: 'Sin bebidas azucaradas.',
    },
  });
  await prisma.customerNote.upsert({
    where: { id: '32000000-0000-4000-8000-000000000101' },
    update: { content: 'Dato exclusivo de Restaurante Prueba.' },
    create: {
      id: '32000000-0000-4000-8000-000000000101',
      restaurantId: TEST_RESTAURANT_ID,
      customerId: testCustomers[0][0],
      content: 'Dato exclusivo de Restaurante Prueba.',
    },
  });
  await prisma.customerPreference.upsert({
    where: { id: '33000000-0000-4000-8000-000000000101' },
    update: { description: 'Prefiere servicio rápido.' },
    create: {
      id: '33000000-0000-4000-8000-000000000101',
      restaurantId: TEST_RESTAURANT_ID,
      customerId: testCustomers[0][0],
      description: 'Prefiere servicio rápido.',
    },
  });

  console.log('Seed de clientes completado para dos restaurantes');
}

void main()
  .catch((error: unknown) => {
    console.error(
      'Falló el seed de clientes:',
      error instanceof Error ? error.message : 'error desconocido',
    );
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
