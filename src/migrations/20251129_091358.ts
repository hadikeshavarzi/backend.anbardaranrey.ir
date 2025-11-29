import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_receipts_status" AS ENUM('draft', 'final');
  CREATE TYPE "public"."enum_receipts_payment_payment_by" AS ENUM('customer', 'warehouse');
  CREATE TYPE "public"."enum_receiptitems_production_type" AS ENUM('domestic', 'import');
  CREATE TABLE "receipts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"receipt_no" numeric,
  	"member_id" integer NOT NULL,
  	"status" "enum_receipts_status" DEFAULT 'draft' NOT NULL,
  	"doc_date" timestamp(3) with time zone NOT NULL,
  	"owner_id" integer NOT NULL,
  	"deliverer_id" integer,
  	"driver_name" varchar,
  	"driver_national_id" varchar,
  	"driver_birth_date" timestamp(3) with time zone,
  	"plate_iran_right" varchar,
  	"plate_mid3" varchar,
  	"plate_letter" varchar,
  	"plate_left2" varchar,
  	"finance_load_cost" numeric DEFAULT 0,
  	"finance_unload_cost" numeric DEFAULT 0,
  	"finance_warehouse_cost" numeric DEFAULT 0,
  	"finance_tax" numeric DEFAULT 0,
  	"finance_return_freight" numeric DEFAULT 0,
  	"finance_loading_fee" numeric DEFAULT 0,
  	"finance_misc_cost" numeric DEFAULT 0,
  	"finance_misc_description" varchar,
  	"payment_payment_by" "enum_receipts_payment_payment_by",
  	"payment_card_number" varchar,
  	"payment_account_number" varchar,
  	"payment_bank_name" varchar,
  	"payment_owner_name" varchar,
  	"payment_tracking_code" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "receipts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"receiptitems_id" integer
  );
  
  CREATE TABLE "receiptitems" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"national_product_id" varchar,
  	"product_description" varchar,
  	"group" varchar,
  	"description" varchar NOT NULL,
  	"count" numeric DEFAULT 0,
  	"unit" varchar,
  	"production_type" "enum_receiptitems_production_type",
  	"is_used" boolean DEFAULT false,
  	"is_defective" boolean DEFAULT false,
  	"weights_full_weight" numeric DEFAULT 0,
  	"weights_empty_weight" numeric DEFAULT 0,
  	"weights_net_weight" numeric DEFAULT 0,
  	"weights_origin_weight" numeric DEFAULT 0,
  	"weights_weight_diff" numeric DEFAULT 0,
  	"dimensions_length" numeric DEFAULT 0,
  	"dimensions_width" numeric DEFAULT 0,
  	"dimensions_thickness" numeric DEFAULT 0,
  	"heat_number" varchar,
  	"bundle_no" varchar,
  	"brand" varchar,
  	"order_no" varchar,
  	"depo_location" varchar,
  	"description_notes" varchar,
  	"row" varchar,
  	"member_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "receipts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "receiptitems_id" integer;
  ALTER TABLE "receipts" ADD CONSTRAINT "receipts_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "receipts" ADD CONSTRAINT "receipts_owner_id_customers_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "receipts" ADD CONSTRAINT "receipts_deliverer_id_customers_id_fk" FOREIGN KEY ("deliverer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "receipts_rels" ADD CONSTRAINT "receipts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."receipts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "receipts_rels" ADD CONSTRAINT "receipts_rels_receiptitems_fk" FOREIGN KEY ("receiptitems_id") REFERENCES "public"."receiptitems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "receiptitems" ADD CONSTRAINT "receiptitems_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "receipts_member_idx" ON "receipts" USING btree ("member_id");
  CREATE INDEX "receipts_owner_idx" ON "receipts" USING btree ("owner_id");
  CREATE INDEX "receipts_deliverer_idx" ON "receipts" USING btree ("deliverer_id");
  CREATE INDEX "receipts_updated_at_idx" ON "receipts" USING btree ("updated_at");
  CREATE INDEX "receipts_created_at_idx" ON "receipts" USING btree ("created_at");
  CREATE INDEX "receipts_rels_order_idx" ON "receipts_rels" USING btree ("order");
  CREATE INDEX "receipts_rels_parent_idx" ON "receipts_rels" USING btree ("parent_id");
  CREATE INDEX "receipts_rels_path_idx" ON "receipts_rels" USING btree ("path");
  CREATE INDEX "receipts_rels_receiptitems_id_idx" ON "receipts_rels" USING btree ("receiptitems_id");
  CREATE INDEX "receiptitems_member_idx" ON "receiptitems" USING btree ("member_id");
  CREATE INDEX "receiptitems_updated_at_idx" ON "receiptitems" USING btree ("updated_at");
  CREATE INDEX "receiptitems_created_at_idx" ON "receiptitems" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_receipts_fk" FOREIGN KEY ("receipts_id") REFERENCES "public"."receipts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_receiptitems_fk" FOREIGN KEY ("receiptitems_id") REFERENCES "public"."receiptitems"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_receipts_id_idx" ON "payload_locked_documents_rels" USING btree ("receipts_id");
  CREATE INDEX "payload_locked_documents_rels_receiptitems_id_idx" ON "payload_locked_documents_rels" USING btree ("receiptitems_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "receipts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "receipts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "receiptitems" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "receipts" CASCADE;
  DROP TABLE "receipts_rels" CASCADE;
  DROP TABLE "receiptitems" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_receipts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_receiptitems_fk";
  
  DROP INDEX "payload_locked_documents_rels_receipts_id_idx";
  DROP INDEX "payload_locked_documents_rels_receiptitems_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "receipts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "receiptitems_id";
  DROP TYPE "public"."enum_receipts_status";
  DROP TYPE "public"."enum_receipts_payment_payment_by";
  DROP TYPE "public"."enum_receiptitems_production_type";`)
}
