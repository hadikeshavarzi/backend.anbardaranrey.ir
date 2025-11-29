import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "receiptitems" DROP CONSTRAINT "receiptitems_group_id_product_categories_id_fk";
  
  ALTER TABLE "receiptitems" DROP CONSTRAINT "receiptitems_description_id_products_id_fk";
  
  DROP INDEX "receiptitems_group_idx";
  DROP INDEX "receiptitems_description_idx";
  ALTER TABLE "receiptitems" ALTER COLUMN "member_id" DROP NOT NULL;
  ALTER TABLE "receiptitems" ADD COLUMN "group" varchar;
  ALTER TABLE "receiptitems" ADD COLUMN "description" varchar NOT NULL;
  ALTER TABLE "receiptitems" DROP COLUMN "group_id";
  ALTER TABLE "receiptitems" DROP COLUMN "description_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "receiptitems" ALTER COLUMN "member_id" SET NOT NULL;
  ALTER TABLE "receiptitems" ADD COLUMN "group_id" integer;
  ALTER TABLE "receiptitems" ADD COLUMN "description_id" integer NOT NULL;
  ALTER TABLE "receiptitems" ADD CONSTRAINT "receiptitems_group_id_product_categories_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "receiptitems" ADD CONSTRAINT "receiptitems_description_id_products_id_fk" FOREIGN KEY ("description_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "receiptitems_group_idx" ON "receiptitems" USING btree ("group_id");
  CREATE INDEX "receiptitems_description_idx" ON "receiptitems" USING btree ("description_id");
  ALTER TABLE "receiptitems" DROP COLUMN "group";
  ALTER TABLE "receiptitems" DROP COLUMN "description";`)
}
