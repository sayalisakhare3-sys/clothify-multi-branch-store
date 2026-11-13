#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/88afb2d46b457d13d32a5b51628714c79ac4402cbb4ca902fe1009a5a1e8fdce/contract';
import startContract from '../../snapshots/88afb2d46b457d13d32a5b51628714c79ac4402cbb4ca902fe1009a5a1e8fdce/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/ff0daad21050fb7c55b4318931b8ed3b37f533bda9813533e7fa655ff8e82474/contract';
import endContract from '../../snapshots/ff0daad21050fb7c55b4318931b8ed3b37f533bda9813533e7fa655ff8e82474/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.setDefault({
        schema: 'public',
        table: 'inventory',
        column: 'updatedAt',
        defaultSql: 'DEFAULT (now())',
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
