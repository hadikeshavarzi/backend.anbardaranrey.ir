import * as migration_20251125_122936 from './20251125_122936';
import * as migration_20251127_142819 from './20251127_142819';
import * as migration_20251129_091358 from './20251129_091358';
import * as migration_20251129_095956 from './20251129_095956';
import * as migration_20251129_103248 from './20251129_103248';

export const migrations = [
  {
    up: migration_20251125_122936.up,
    down: migration_20251125_122936.down,
    name: '20251125_122936',
  },
  {
    up: migration_20251127_142819.up,
    down: migration_20251127_142819.down,
    name: '20251127_142819',
  },
  {
    up: migration_20251129_091358.up,
    down: migration_20251129_091358.down,
    name: '20251129_091358',
  },
  {
    up: migration_20251129_095956.up,
    down: migration_20251129_095956.down,
    name: '20251129_095956',
  },
  {
    up: migration_20251129_103248.up,
    down: migration_20251129_103248.down,
    name: '20251129_103248'
  },
];
