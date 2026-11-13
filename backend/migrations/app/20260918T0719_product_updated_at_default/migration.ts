#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/710d545ffca15b4e0ea27c57438ec00b59b4116da70e5f57c84ea28699465a64/contract';
import startContract from '../../snapshots/710d545ffca15b4e0ea27c57438ec00b59b4116da70e5f57c84ea28699465a64/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/b793db7b24136221513a54dfd4bcf2129e35cb6a82a8ca1e6ee2778abd4af1a5/contract';
import endContract from '../../snapshots/b793db7b24136221513a54dfd4bcf2129e35cb6a82a8ca1e6ee2778abd4af1a5/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'product',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
