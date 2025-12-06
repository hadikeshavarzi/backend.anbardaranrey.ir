import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_clearances_status" AS ENUM('draft', 'final');

    CREATE TABLE "clearances" (
      "id" serial PRIMARY KEY,
      "doc_number" varchar,
      "status" "enum_clearances_status" DEFAULT 'draft' NOT NULL,
      "clearance_date" timestamp(3) with time zone NOT NULL,
      "member_id" integer,
      "owner_id" integer NOT NULL,
      "carrier_info_company_name" varchar,
      "carrier_info_driver_name" varchar,
      "carrier_info_driver_mobile" varchar,
      "carrier_info_plate_iran_right" varchar,
      "carrier_info_plate_mid3" varchar,
      "carrier_info_plate_letter" varchar,
      "carrier_info_plate_left2" varchar,
      "docs_havaleh_number" varchar,
      "docs_havaleh_image_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "clearances_rels" (
      "id" serial PRIMARY KEY,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "clearanceitems_id" integer
    );

    CREATE TABLE "clearanceitems" (
      "id" serial PRIMARY KEY,
      "product_id" integer NOT NULL,
      "specs" varchar,
      "group_name" varchar,
      "parent_id" integer,
      "qty" numeric DEFAULT 0,
      "weight" numeric DEFAULT 0,
      "stock_snapshot_qty_before" numeric DEFAULT 0,
      "stock_snapshot_weight_before" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "clearances_rels" CASCADE;
    DROP TABLE "clearances" CASCADE;
    DROP TABLE "clearanceitems" CASCADE;
    DROP TYPE "public"."enum_clearances_status";
  `)
}
