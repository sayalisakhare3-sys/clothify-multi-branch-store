#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/88afb2d46b457d13d32a5b51628714c79ac4402cbb4ca902fe1009a5a1e8fdce/contract';
import endContract from '../../snapshots/88afb2d46b457d13d32a5b51628714c79ac4402cbb4ca902fe1009a5a1e8fdce/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/b793db7b24136221513a54dfd4bcf2129e35cb6a82a8ca1e6ee2778abd4af1a5/contract';
import startContract from '../../snapshots/b793db7b24136221513a54dfd4bcf2129e35cb6a82a8ca1e6ee2778abd4af1a5/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'productVariant',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
