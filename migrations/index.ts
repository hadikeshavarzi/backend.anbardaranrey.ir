import * as migration_20251127_140318 from './20251127_140318';

export const migrations = [
  {
    up: migration_20251127_140318.up,
    down: migration_20251127_140318.down,
    name: '20251127_140318'
  },
];
