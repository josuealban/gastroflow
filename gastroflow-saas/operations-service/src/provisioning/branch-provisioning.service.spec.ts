/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { execFile } from 'child_process';
import { Pool } from 'pg';
import { BranchProvisioningService } from './branch-provisioning.service';

jest.mock('child_process', () => ({ execFile: jest.fn() }));

describe('BranchProvisioningService idempotent retry', () => {
  it('retries after completed copy without duplicates and returns safe verification counts', async () => {
    (execFile as unknown as jest.Mock).mockImplementation(
      (...args: unknown[]) => {
        (args.at(-1) as (error: null, value: object) => void)(null, {});
      },
    );
    const query = jest
      .fn()
      .mockImplementation((sql: string) =>
        Promise.resolve(
          sql.startsWith('SELECT')
            ? { rows: [{ exists: true }] }
            : { rows: [] },
        ),
      );
    jest.spyOn(Pool.prototype, 'query').mockImplementation(query as never);
    jest.spyOn(Pool.prototype, 'end').mockResolvedValue(undefined);

    const categories: Array<{
      id: string;
      name: string;
      description: null;
      isActive: boolean;
    }> = [];
    const products: Array<{
      id: string;
      name: string;
      categoryId: string;
      description: string;
      price: number;
      imageUrl: null;
      isAvailable: boolean;
    }> = [];
    const inventory: Array<{
      id: string;
      name: string;
      description: null;
      type: string;
      unit: string;
      minimumStock: number;
      isActive: boolean;
      currentStock: number;
      costPerUnit: number;
      damagedQuantity: number;
      lostQuantity: number;
    }> = [];
    const taxes: Array<{
      id: string;
      name: string;
      rate: number;
      effectiveFrom: Date;
      isActive: boolean;
    }> = [];
    const sequences: Array<{
      id: string;
      establishment: string;
      emissionPoint: string;
      currentNumber: number;
    }> = [];
    const tx: Record<string, unknown> = {
      category: {
        upsert: jest.fn(({ where, create, update }) => {
          let row = categories.find((x) => x.name === where.name);
          if (row) Object.assign(row, update);
          else {
            row = { id: `target-category-${categories.length + 1}`, ...create };
            categories.push(row);
          }
          return row;
        }),
        findMany: jest.fn(() =>
          categories.map(({ id, name }) => ({ id, name })),
        ),
      },
      product: {
        upsert: jest.fn(({ where, create, update }) => {
          let row = products.find((x) => x.name === where.name);
          if (row) Object.assign(row, update);
          else {
            row = { id: `target-product-${products.length + 1}`, ...create };
            products.push(row);
          }
          return row;
        }),
        findMany: jest.fn(() =>
          products.map(({ id, name, categoryId }) => ({
            id,
            name,
            categoryId,
          })),
        ),
        count: jest.fn(({ where } = {}) =>
          where?.isAvailable === true
            ? products.filter((x) => x.isAvailable).length
            : products.length,
        ),
      },
      inventoryItem: {
        upsert: jest.fn(({ where, create, update }) => {
          let row = inventory.find((x) => x.name === where.name);
          if (row) Object.assign(row, update);
          else {
            row = { id: `target-inventory-${inventory.length + 1}`, ...create };
            inventory.push(row);
          }
          return row;
        }),
        findMany: jest.fn(() => inventory.map(({ id }) => ({ id }))),
        count: jest.fn(({ where } = {}) =>
          where
            ? inventory.filter(
                (x) =>
                  x.currentStock ||
                  x.costPerUnit ||
                  x.damagedQuantity ||
                  x.lostQuantity,
              ).length
            : inventory.length,
        ),
      },
      taxConfiguration: {
        findFirst: jest.fn(() => taxes[0] ?? null),
        count: jest.fn(() => taxes.filter((x) => x.isActive).length),
        create: jest.fn(({ data }) => {
          const row = { id: 'target-tax', ...data };
          taxes.push(row);
          return row;
        }),
        update: jest.fn(({ data }) => Object.assign(taxes[0], data)),
        deleteMany: jest.fn(() => {
          taxes.splice(1);
          return { count: 0 };
        }),
      },
      invoiceSequence: {
        upsert: jest.fn(({ create, update }) => {
          if (sequences[0]) Object.assign(sequences[0], update);
          else sequences.push({ id: 'target-sequence', ...create });
          return sequences[0];
        }),
        findFirst: jest.fn(() => sequences[0] ?? null),
        count: jest.fn(() => sequences.length),
      },
    };
    for (const name of [
      'customer',
      'reservation',
      'restaurantTable',
      'order',
      'payment',
      'invoice',
      'supplier',
      'purchase',
      'inventoryMovement',
      'orderItem',
      'invoiceItem',
      'purchaseItem',
      'outboxEvent',
    ])
      tx[name] = { count: jest.fn(() => 0) };
    const target = {
      ...tx,
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $transaction: jest.fn((callback: (value: unknown) => unknown) =>
        callback(tx),
      ),
    };
    const source = {
      category: {
        findMany: jest.fn(() => [
          {
            id: 'source-category',
            name: 'Comidas',
            description: null,
            isActive: true,
          },
        ]),
      },
      product: {
        findMany: jest.fn(() => [
          {
            id: 'source-product',
            categoryId: 'source-category',
            name: 'Sopa',
            description: 'Sopa',
            price: 5,
            imageUrl: null,
          },
        ]),
      },
      inventoryItem: {
        findMany: jest.fn(() => [
          {
            id: 'source-inventory',
            name: 'Sal',
            description: null,
            type: 'INGREDIENT',
            unit: 'GRAM',
            minimumStock: 1,
            isActive: true,
          },
        ]),
      },
      taxConfiguration: {
        findFirst: jest.fn(() => ({
          id: 'source-tax',
          name: 'IVA',
          rate: 0.15,
        })),
      },
    };
    const config = {
      get: (key: string) =>
        ({
          POSTGRES_ADMIN_URL: 'fake',
          INTERNAL_SERVICE_TOKEN: 'token',
          BRANCH_PROVISIONING_ALLOWED_HOST: '127.0.0.1',
          BRANCH_PROVISIONING_ALLOWED_PORT: '5432',
        })[key],
    };
    const ids = {
      validate: (value: string) => value,
      quote: (value: string) => `"${value}"`,
      literal: () => "'fake'",
    };
    const service = new BranchProvisioningService(
      config as never,
      ids,
      { getClientByBranchId: jest.fn(() => source) } as never,
      { create: jest.fn(() => target) } as never,
    );
    const input = {
      branchId: '10000000-0000-4000-8000-000000000001',
      target: {
        host: '127.0.0.1',
        port: 5432,
        databaseName: 'gf_test_branch',
        databaseUser: 'gf_test_user',
        databasePassword: 'fake',
      },
      templateBranchId: '20000000-0000-4000-8000-000000000001',
      restaurantDefaults: { taxName: 'IVA', taxRate: 0.15 },
    };
    const first = await service.provision(input),
      second = await service.provision(input);
    expect(second).toEqual(first);
    expect({
      categories: categories.length,
      products: products.length,
      inventory: inventory.length,
      taxes: taxes.length,
      sequences: sequences.length,
    }).toEqual({
      categories: 1,
      products: 1,
      inventory: 1,
      taxes: 1,
      sequences: 1,
    });
    expect(products[0].categoryId).toBe(categories[0].id);
    expect([categories[0].id, products[0].id, inventory[0].id]).not.toContain(
      'source-category',
    );
    expect(first).toMatchObject({
      success: true,
      counts: {
        categories: 1,
        products: 1,
        inventoryItems: 1,
        outboxEvents: 0,
        transactionalRows: 0,
      },
    });
  });
});
