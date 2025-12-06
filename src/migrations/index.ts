import * as migration_20251202_134934 from './20251202_134934';
import * as migration_20251202_191026 from './20251202_191026';

export const migrations = [
  {
    up: migration_20251202_134934.up,
    down: migration_20251202_134934.down,
    name: '20251202_134934',
  },
  {
    up: migration_20251202_191026.up,
    down: migration_20251202_191026.down,
    name: '20251202_191026'
  },
];
