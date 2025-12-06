import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {

  // 1) ستون‌ها را اضافه کن (با IF NOT EXISTS)
  await db.execute(sql`
    ALTER TABLE "receiptitems"
    ADD COLUMN IF NOT EXISTS "is_parent" BOOLEAN DEFAULT false;
  `);

  await db.execute(sql`
    ALTER TABLE "receiptitems"
    ADD COLUMN IF NOT EXISTS "parent_id" INT;
  `);

  await db.execute(sql`
    ALTER TABLE "receiptitems"
    ADD COLUMN IF NOT EXISTS "parent_row" VARCHAR;
  `);

  await db.execute(sql`
    ALTER TABLE "receiptitems"
    ADD COLUMN IF NOT EXISTS "owner_id" INT;
  `);

  // 2) اگر FK قبلی وجود دارد، حذف کن
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'receiptitems_parent_fk'
      ) THEN
        ALTER TABLE "receiptitems" DROP CONSTRAINT receiptitems_parent_fk;
      END IF;
    END$$;
  `);

  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'receiptitems_owner_fk'
      ) THEN
        ALTER TABLE "receiptitems" DROP CONSTRAINT receiptitems_owner_fk;
      END IF;
    END$$;
  `);

  // 3) حالا FK جدید را بدون IF NOT EXISTS اضافه کن
  await db.execute(sql`
    ALTER TABLE "receiptitems"
    ADD CONSTRAINT receiptitems_parent_fk
    FOREIGN KEY ("parent_id") REFERENCES "receiptitems" ("id")
    ON DELETE SET NULL;
  `);

  await db.execute(sql`
    ALTER TABLE "receiptitems"
    ADD CONSTRAINT receiptitems_owner_fk
    FOREIGN KEY ("owner_id") REFERENCES "customers" ("id")
    ON DELETE SET NULL;
  `);

  // 4) Index
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_receiptitems_owner
    ON "receiptitems" ("owner_id");
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_receiptitems_parent
    ON "receiptitems" ("parent_id");
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_receiptitems_row
    ON "receiptitems" ("row");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {

  await db.execute(sql`
    ALTER TABLE "receiptitems" DROP CONSTRAINT IF EXISTS receiptitems_parent_fk;
  `);

  await db.execute(sql`
    ALTER TABLE "receiptitems" DROP CONSTRAINT IF EXISTS receiptitems_owner_fk;
  `);

  await db.execute(sql`
    ALTER TABLE "receiptitems" DROP COLUMN IF EXISTS "is_parent";
  `);

  await db.execute(sql`
    ALTER TABLE "receiptitems" DROP COLUMN IF EXISTS "parent_id";
  `);

  await db.execute(sql`
    ALTER TABLE "receiptitems" DROP COLUMN IF EXISTS "parent_row";
  `);

  await db.execute(sql`
    ALTER TABLE "receiptitems" DROP COLUMN IF EXISTS "owner_id";
  `);

}
