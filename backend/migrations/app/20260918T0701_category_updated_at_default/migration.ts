#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/70e0e92ab1ee0a7500459941f9700721863948852c67196de08ac92ff216c945/contract';
import startContract from '../../snapshots/70e0e92ab1ee0a7500459941f9700721863948852c67196de08ac92ff216c945/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/710d545ffca15b4e0ea27c57438ec00b59b4116da70e5f57c84ea28699465a64/contract';
import endContract from '../../snapshots/710d545ffca15b4e0ea27c57438ec00b59b4116da70e5f57c84ea28699465a64/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'category',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
