#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/70e0e92ab1ee0a7500459941f9700721863948852c67196de08ac92ff216c945/contract';
import endContract from '../../snapshots/70e0e92ab1ee0a7500459941f9700721863948852c67196de08ac92ff216c945/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/84a668ce7c75b829d47fdcdbc97fdcb92cfe38ca7de85d8b9a7d3f816a4ae849/contract';
import startContract from '../../snapshots/84a668ce7c75b829d47fdcdbc97fdcb92cfe38ca7de85d8b9a7d3f816a4ae849/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'branch',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
