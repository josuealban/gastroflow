import { execFile } from 'child_process';
import { promisify } from 'util';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { BranchDatabaseService } from '../database/branch/branch-database.service';
import { BranchPrismaClientFactory } from '../database/branch/branch-prisma-client.factory';
import { SqlIdentifierService } from './sql-identifier.service';
const run = promisify(execFile);
export interface ProvisionInput {
  branchId: string;
  target: {
    host: string;
    port: number;
    databaseName: string;
    databaseUser: string;
    databasePassword: string;
  };
  templateBranchId: string | null;
  restaurantDefaults: { taxName: string; taxRate: number };
}
@Injectable()
export class BranchProvisioningService {
  private readonly adminUrl: string;
  private readonly token: string;
  private readonly host: string;
  private readonly port: number;
  private readonly timeout: number;
  constructor(
    config: ConfigService,
    private readonly ids: SqlIdentifierService,
    private readonly branches: BranchDatabaseService,
    private readonly factory: BranchPrismaClientFactory,
  ) {
    this.adminUrl = config.get('POSTGRES_ADMIN_URL') ?? '';
    this.token = config.get('INTERNAL_SERVICE_TOKEN') ?? '';
    this.host = config.get('BRANCH_PROVISIONING_ALLOWED_HOST') ?? '127.0.0.1';
    this.port = Number(config.get('BRANCH_PROVISIONING_ALLOWED_PORT') ?? 5432);
    this.timeout = Number(config.get('BRANCH_MIGRATION_TIMEOUT_MS') ?? 120000);
  }
  authorize(token: string) {
    if (!this.token || token !== this.token) throw new Error('Unauthorized');
  }
  async provision(input: ProvisionInput) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        input.branchId,
      )
    )
      throw new Error('Invalid branch identifier');
    if (input.target.host !== this.host || input.target.port !== this.port)
      throw new Error('Provisioning target is not allowed');
    const db = this.ids.validate(input.target.databaseName),
      user = this.ids.validate(input.target.databaseUser);
    const pool = new Pool({ connectionString: this.adminUrl });
    try {
      const role = await pool.query<{ exists: boolean }>(
        'SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname=$1) AS exists',
        [user],
      );
      if (!role.rows[0]?.exists)
        await pool.query(
          `CREATE ROLE ${this.ids.quote(user)} LOGIN PASSWORD ${this.ids.literal(input.target.databasePassword)}`,
        );
      else
        await pool.query(
          `ALTER ROLE ${this.ids.quote(user)} PASSWORD ${this.ids.literal(input.target.databasePassword)}`,
        );
      const database = await pool.query<{ exists: boolean }>(
        'SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname=$1) AS exists',
        [db],
      );
      if (!database.rows[0]?.exists)
        await pool.query(
          `CREATE DATABASE ${this.ids.quote(db)} OWNER ${this.ids.quote(user)}`,
        );
    } finally {
      await pool.end();
    }
    const url = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(input.target.databasePassword)}@${input.target.host}:${input.target.port}/${db}?schema=public`;
    const prisma =
      process.platform === 'win32'
        ? 'node_modules/.bin/prisma.cmd'
        : 'node_modules/.bin/prisma';
    await run(
      prisma,
      ['migrate', 'deploy', '--config', 'prisma/branch/prisma.config.ts'],
      {
        cwd: process.cwd(),
        env: { ...process.env, BRANCH_DATABASE_URL: url },
        timeout: this.timeout,
        windowsHide: true,
      },
    );
    const target = this.factory.create({
      branchId: input.branchId,
      database: db,
      host: input.target.host,
      port: input.target.port,
      user,
      password: input.target.databasePassword,
    });
    await target.$connect();
    try {
      let templateExpected: null | {
        categoryIds: Set<string>;
        productIds: Set<string>;
        inventoryIds: Set<string>;
        productCategoryNames: Map<string, string>;
        categories: number;
        products: number;
        inventoryItems: number;
      } = null;
      if (input.templateBranchId) {
        const source = await this.branches.getClientByBranchId(
          input.templateBranchId,
        );
        const [categories, products, inventory, tax] = await Promise.all([
          source.category.findMany(),
          source.product.findMany(),
          source.inventoryItem.findMany(),
          source.taxConfiguration.findFirst({
            where: { isActive: true },
            orderBy: { effectiveFrom: 'desc' },
          }),
        ]);
        const categoryNames = new Map(
          categories.map((category) => [category.id, category.name]),
        );
        templateExpected = {
          categoryIds: new Set(categories.map((item) => item.id)),
          productIds: new Set(products.map((item) => item.id)),
          inventoryIds: new Set(inventory.map((item) => item.id)),
          productCategoryNames: new Map(
            products.map((product) => [
              product.name,
              categoryNames.get(product.categoryId) ?? '',
            ]),
          ),
          categories: categories.length,
          products: products.length,
          inventoryItems: inventory.length,
        };
        await target.$transaction(async (tx) => {
          const map = new Map<string, string>();
          for (const item of categories) {
            const created = await tx.category.upsert({
              where: { name: item.name },
              create: {
                name: item.name,
                description: item.description,
                isActive: item.isActive,
              },
              update: {
                description: item.description,
                isActive: item.isActive,
              },
            });
            map.set(item.id, created.id);
          }
          for (const item of products) {
            const categoryId = map.get(item.categoryId);
            if (categoryId)
              await tx.product.upsert({
                where: { name: item.name },
                create: {
                  categoryId,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  isAvailable: false,
                },
                update: {
                  categoryId,
                  description: item.description,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  isAvailable: false,
                },
              });
          }
          for (const item of inventory)
            await tx.inventoryItem.upsert({
              where: { name: item.name },
              create: {
                name: item.name,
                description: item.description,
                type: item.type,
                unit: item.unit,
                minimumStock: item.minimumStock,
                isActive: item.isActive,
                currentStock: 0,
                costPerUnit: 0,
                damagedQuantity: 0,
                lostQuantity: 0,
              },
              update: {
                description: item.description,
                type: item.type,
                unit: item.unit,
                minimumStock: item.minimumStock,
                isActive: item.isActive,
                currentStock: 0,
                costPerUnit: 0,
                damagedQuantity: 0,
                lostQuantity: 0,
              },
            });
          const existingTax = await tx.taxConfiguration.findFirst({
            orderBy: { createdAt: 'asc' },
          });
          const taxData = {
            name: tax?.name ?? input.restaurantDefaults.taxName,
            rate: tax?.rate ?? input.restaurantDefaults.taxRate,
            effectiveFrom: new Date(),
            isActive: true,
          };
          if (existingTax) {
            await tx.taxConfiguration.update({
              where: { id: existingTax.id },
              data: taxData,
            });
            await tx.taxConfiguration.deleteMany({
              where: { id: { not: existingTax.id } },
            });
          } else await tx.taxConfiguration.create({ data: taxData });
          await tx.invoiceSequence.upsert({
            where: {
              establishment_emissionPoint: {
                establishment: '001',
                emissionPoint: '001',
              },
            },
            create: {
              establishment: '001',
              emissionPoint: '001',
              currentNumber: 0,
            },
            update: { currentNumber: 0 },
          });
        });
      } else {
        await target.$transaction(async (tx) => {
          const existingTax = await tx.taxConfiguration.findFirst({
            orderBy: { createdAt: 'asc' },
          });
          const taxData = {
            name: input.restaurantDefaults.taxName,
            rate: input.restaurantDefaults.taxRate,
            effectiveFrom: new Date(),
            isActive: true,
          };
          if (existingTax) {
            await tx.taxConfiguration.update({
              where: { id: existingTax.id },
              data: taxData,
            });
            await tx.taxConfiguration.deleteMany({
              where: { id: { not: existingTax.id } },
            });
          } else await tx.taxConfiguration.create({ data: taxData });
          await tx.invoiceSequence.upsert({
            where: {
              establishment_emissionPoint: {
                establishment: '001',
                emissionPoint: '001',
              },
            },
            create: {
              establishment: '001',
              emissionPoint: '001',
              currentNumber: 0,
            },
            update: { currentNumber: 0 },
          });
        });
      }
      const [
        taxCount,
        sequence,
        sequenceCount,
        customers,
        reservations,
        tables,
        orders,
        payments,
        invoices,
        suppliers,
        purchases,
        movements,
        invalidProducts,
        invalidInventory,
        orderItems,
        invoiceItems,
        purchaseItems,
        outboxEvents,
        targetCategories,
        targetProducts,
        targetInventory,
      ] = await Promise.all([
        target.taxConfiguration.count({ where: { isActive: true } }),
        target.invoiceSequence.findFirst(),
        target.invoiceSequence.count(),
        target.customer.count(),
        target.reservation.count(),
        target.restaurantTable.count(),
        target.order.count(),
        target.payment.count(),
        target.invoice.count(),
        target.supplier.count(),
        target.purchase.count(),
        target.inventoryMovement.count(),
        target.product.count({ where: { isAvailable: true } }),
        target.inventoryItem.count({
          where: {
            OR: [
              { currentStock: { not: 0 } },
              { costPerUnit: { not: 0 } },
              { damagedQuantity: { not: 0 } },
              { lostQuantity: { not: 0 } },
            ],
          },
        }),
        target.orderItem.count(),
        target.invoiceItem.count(),
        target.purchaseItem.count(),
        target.outboxEvent.count(),
        target.category.findMany({ select: { id: true, name: true } }),
        target.product.findMany({
          select: { id: true, name: true, categoryId: true },
        }),
        target.inventoryItem.findMany({ select: { id: true } }),
      ]);
      const transactionRows =
        customers +
        reservations +
        tables +
        orders +
        payments +
        invoices +
        suppliers +
        purchases +
        movements +
        orderItems +
        invoiceItems +
        purchaseItems +
        outboxEvents;
      const targetCategoryNames = new Map(
        targetCategories.map((category) => [category.id, category.name]),
      );
      const templateMatches =
        !templateExpected ||
        (targetCategories.length === templateExpected.categories &&
          targetProducts.length === templateExpected.products &&
          targetInventory.length === templateExpected.inventoryItems &&
          targetCategories.every(
            (item) => !templateExpected.categoryIds.has(item.id),
          ) &&
          targetProducts.every(
            (item) =>
              !templateExpected.productIds.has(item.id) &&
              targetCategoryNames.get(item.categoryId) ===
                templateExpected.productCategoryNames.get(item.name),
          ) &&
          targetInventory.every(
            (item) => !templateExpected.inventoryIds.has(item.id),
          ));
      if (
        taxCount !== 1 ||
        !sequence ||
        sequenceCount !== 1 ||
        sequence.currentNumber !== 0 ||
        invalidProducts !== 0 ||
        invalidInventory !== 0 ||
        transactionRows !== 0 ||
        !templateMatches
      )
        throw new Error('Provisioning verification failed');
      return {
        success: true,
        counts: {
          categories: targetCategories.length,
          products: targetProducts.length,
          inventoryItems: targetInventory.length,
          taxConfigurations: taxCount,
          invoiceSequences: sequenceCount,
          transactionalRows: transactionRows,
          outboxEvents,
        },
      };
    } finally {
      await target.$disconnect();
    }
  }
}
