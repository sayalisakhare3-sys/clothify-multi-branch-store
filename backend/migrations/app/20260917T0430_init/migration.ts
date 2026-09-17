#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/84a668ce7c75b829d47fdcdbc97fdcb92cfe38ca7de85d8b9a7d3f816a4ae849/contract';
import endContract from '../../snapshots/84a668ce7c75b829d47fdcdbc97fdcb92cfe38ca7de85d8b9a7d3f816a4ae849/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'branch',
        columns: [
          col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('city', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'category',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'customer',
        columns: [
          col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'inventory',
        columns: [
          col('branchId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('quantity', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('reorderLevel', 'int4', {
            notNull: true,
            default: lit(5),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('variantId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'product',
        columns: [
          col('categoryId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sku', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'productVariant',
        columns: [
          col('color', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('costPrice', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('price', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('productId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('size', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sku', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'sale',
        columns: [
          col('branchId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('cashierId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('customerId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('discount', 'float8', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('invoiceNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('paymentMethod', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('COMPLETED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('subtotal', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('tax', 'float8', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('total', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'sale_paymentMethod_check_eb930ef9',
            "\"paymentMethod\" IN ('CASH', 'CARD', 'UPI', 'OTHER')",
          ),
          checkExpression(
            'sale_status_check_490fe836',
            "\"status\" IN ('COMPLETED', 'CANCELLED', 'REFUNDED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'saleItem',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('discount', 'float8', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/float8@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('saleId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('total', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('unitPrice', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('variantId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('branchId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('CASHIER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'user_role_check_1047a369',
            "\"role\" IN ('OWNER', 'MANAGER', 'CASHIER')",
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'category',
        constraint: 'category_name_key',
        columns: ['name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'inventory',
        constraint: 'inventory_branchId_variantId_key',
        columns: ['branchId', 'variantId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'product',
        constraint: 'product_sku_key',
        columns: ['sku'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'productVariant',
        constraint: 'productVariant_sku_key',
        columns: ['sku'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'productVariant',
        constraint: 'productVariant_productId_size_color_key',
        columns: ['productId', 'size', 'color'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'sale',
        constraint: 'sale_invoiceNumber_key',
        columns: ['invoiceNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventory',
        index: 'inventory_branchId_idx_d04da5bb',
        columns: ['branchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'inventory',
        index: 'inventory_variantId_idx_e16bb45d',
        columns: ['variantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'product',
        index: 'product_categoryId_idx_15c304f2',
        columns: ['categoryId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'productVariant',
        index: 'productVariant_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sale',
        index: 'sale_branchId_idx_d04da5bb',
        columns: ['branchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sale',
        index: 'sale_cashierId_idx_f55c4cfd',
        columns: ['cashierId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'sale',
        index: 'sale_customerId_idx_b2a8a46c',
        columns: ['customerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'saleItem',
        index: 'saleItem_saleId_idx_b4c0fb73',
        columns: ['saleId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'saleItem',
        index: 'saleItem_variantId_idx_e16bb45d',
        columns: ['variantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'user',
        index: 'user_branchId_idx_d04da5bb',
        columns: ['branchId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventory',
        foreignKey: {
          name: 'inventory_branchId_fkey',
          columns: ['branchId'],
          references: { schema: 'public', table: 'branch', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'inventory',
        foreignKey: {
          name: 'inventory_variantId_fkey',
          columns: ['variantId'],
          references: { schema: 'public', table: 'productVariant', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'product',
        foreignKey: {
          name: 'product_categoryId_fkey',
          columns: ['categoryId'],
          references: { schema: 'public', table: 'category', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'productVariant',
        foreignKey: {
          name: 'productVariant_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'product', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sale',
        foreignKey: {
          name: 'sale_branchId_fkey',
          columns: ['branchId'],
          references: { schema: 'public', table: 'branch', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sale',
        foreignKey: {
          name: 'sale_cashierId_fkey',
          columns: ['cashierId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'sale',
        foreignKey: {
          name: 'sale_customerId_fkey',
          columns: ['customerId'],
          references: { schema: 'public', table: 'customer', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'saleItem',
        foreignKey: {
          name: 'saleItem_saleId_fkey',
          columns: ['saleId'],
          references: { schema: 'public', table: 'sale', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'saleItem',
        foreignKey: {
          name: 'saleItem_variantId_fkey',
          columns: ['variantId'],
          references: { schema: 'public', table: 'productVariant', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'user',
        foreignKey: {
          name: 'user_branchId_fkey',
          columns: ['branchId'],
          references: { schema: 'public', table: 'branch', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
