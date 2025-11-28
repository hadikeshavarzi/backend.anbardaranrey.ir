import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_customers_customer_type" AS ENUM('real', 'company');
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_type" "enum_customers_customer_type" DEFAULT 'real' NOT NULL,
  	"name" varchar NOT NULL,
  	"national_id" varchar,
  	"mobile" varchar,
  	"phone" varchar,
  	"economic_code" varchar,
  	"postal_code" varchar,
  	"birth_or_register_date" timestamp(3) with time zone,
  	"address" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "members_sessions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "members_sessions" CASCADE;
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_members_fk";
  
  DROP INDEX "payload_preferences_rels_members_id_idx";
  ALTER TABLE "members" ALTER COLUMN "role" SET DEFAULT 'union_member';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "customers_id" integer;
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  ALTER TABLE "members" DROP COLUMN "reset_password_token";
  ALTER TABLE "members" DROP COLUMN "reset_password_expiration";
  ALTER TABLE "members" DROP COLUMN "salt";
  ALTER TABLE "members" DROP COLUMN "hash";
  ALTER TABLE "members" DROP COLUMN "login_attempts";
  ALTER TABLE "members" DROP COLUMN "lock_until";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "members_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "members_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "customers" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_customers_fk";
  
  DROP INDEX "payload_locked_documents_rels_customers_id_idx";
  ALTER TABLE "members" ALTER COLUMN "role" SET DEFAULT 'union_user';
  ALTER TABLE "members" ADD COLUMN "reset_password_token" varchar;
  ALTER TABLE "members" ADD COLUMN "reset_password_expiration" timestamp(3) with time zone;
  ALTER TABLE "members" ADD COLUMN "salt" varchar;
  ALTER TABLE "members" ADD COLUMN "hash" varchar;
  ALTER TABLE "members" ADD COLUMN "login_attempts" numeric DEFAULT 0;
  ALTER TABLE "members" ADD COLUMN "lock_until" timestamp(3) with time zone;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "members_id" integer;
  ALTER TABLE "members_sessions" ADD CONSTRAINT "members_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "members_sessions_order_idx" ON "members_sessions" USING btree ("_order");
  CREATE INDEX "members_sessions_parent_id_idx" ON "members_sessions" USING btree ("_parent_id");
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_preferences_rels_members_id_idx" ON "payload_preferences_rels" USING btree ("members_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "customers_id";
  DROP TYPE "public"."enum_customers_customer_type";`)
}
