import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {

  /* ============================================
     1) جدول clearanceitems (بدون FK)
  ============================================ */
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "clearanceitems" (
      "id" SERIAL PRIMARY KEY,

      "product" INT,
      "specs" TEXT,
      "groupName" TEXT,

      "parent" INT,

      "qty" NUMERIC DEFAULT 0,
      "weight" NUMERIC DEFAULT 0,

      "stockSnapshot_qtyBefore" NUMERIC DEFAULT 0,
      "stockSnapshot_weightBefore" NUMERIC DEFAULT 0,

      "createdAt" TIMESTAMP DEFAULT now(),
      "updatedAt" TIMESTAMP DEFAULT now()
    );
  `);

  /* ============================================
     2) جدول inventorytransactions (بدون FK)
  ============================================ */
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "inventorytransactions" (
      "id" SERIAL PRIMARY KEY,

      "product" INT,

      "type" VARCHAR(10) NOT NULL DEFAULT 'out',
      "qty" NUMERIC DEFAULT 0,
      "weight" NUMERIC DEFAULT 0,

      "snapshot_qtyBefore" NUMERIC DEFAULT 0,
      "snapshot_qtyAfter" NUMERIC DEFAULT 0,
      "snapshot_weightBefore" NUMERIC DEFAULT 0,
      "snapshot_weightAfter" NUMERIC DEFAULT 0,

      "refClearance" INT,

      "createdAt" TIMESTAMP DEFAULT now(),
      "updatedAt" TIMESTAMP DEFAULT now()
    );
  `);

  /* ============================================
     3) Indexes ONLY
  ============================================ */
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_clearanceitems_product
    ON "clearanceitems" ("product");
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_inventorytransactions_product
    ON "inventorytransactions" ("product");
  `);
}


/* ============================================
   DOWN
============================================ */
export async function down({ db }: MigrateDownArgs): Promise<void> {

  await db.execute(sql`
    DROP TABLE IF EXISTS "inventorytransactions" CASCADE;
  `);

  await db.execute(sql`
    DROP TABLE IF EXISTS "clearanceitems" CASCADE;
  `);
}
