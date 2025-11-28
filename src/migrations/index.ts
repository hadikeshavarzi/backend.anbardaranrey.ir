import * as migration_20251125_122936 from './20251125_122936';
import * as migration_20251127_142819 from './20251127_142819';

export const migrations = [
  {
    up: migration_20251125_122936.up,
    down: migration_20251125_122936.down,
    name: '20251125_122936',
  },
  {
    up: migration_20251127_142819.up,
    down: migration_20251127_142819.down,
    name: '20251127_142819'
  },
];
