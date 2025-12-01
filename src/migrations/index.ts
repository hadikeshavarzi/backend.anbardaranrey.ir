import * as migration_20251130_081514 from './20251130_081514';

export const migrations = [
  {
    up: migration_20251130_081514.up,
    down: migration_20251130_081514.down,
    name: '20251130_081514'
  },
];
