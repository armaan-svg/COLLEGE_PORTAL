CREATE SEQUENCE IF NOT EXISTS registration_reference_seq;
--> statement-breakpoint
CREATE TABLE "administrators" (
	"user_id" text PRIMARY KEY,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit" (
	"id" serial PRIMARY KEY,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"reference" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_config" (
	"id" integer PRIMARY KEY DEFAULT 1,
	"min_members" integer DEFAULT 4 NOT NULL,
	"max_members" integer DEFAULT 6 NOT NULL,
	"registration_open" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "valid_team_limits" CHECK ("min_members" >= 1 and "max_members" >= "min_members" and "max_members" <= 20)
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" serial PRIMARY KEY,
	"registration_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"mobile" text NOT NULL UNIQUE,
	"institution" text NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "valid_member_role" CHECK ("role" in ('leader', 'member'))
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" serial PRIMARY KEY,
	"reference" text DEFAULT 'NASA2026-BIAS-' || lpad(nextval('registration_reference_seq')::text, 6, '0') NOT NULL UNIQUE,
	"owner_id" text NOT NULL UNIQUE,
	"team_name" text NOT NULL,
	"institution" text NOT NULL,
	"category" text NOT NULL,
	"mentor" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"member_count" integer NOT NULL,
	"consent_version" text DEFAULT '2026-01' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "valid_category" CHECK ("category" in ('school', 'college')),
	CONSTRAINT "valid_status" CHECK ("status" in ('pending', 'approved', 'rejected')),
	CONSTRAINT "valid_member_count" CHECK ("member_count" between 1 and 20)
);
--> statement-breakpoint
CREATE INDEX "participant_registration_idx" ON "participants" ("registration_id");--> statement-breakpoint
CREATE INDEX "registration_status_idx" ON "registrations" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_team_name" ON "registrations" (lower("team_name"));--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_registration_id_registrations_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE;
