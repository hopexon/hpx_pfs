-- Align Supabase database with Prisma schema

-- 1. Create music_review_users table (required for Prisma user relation)
CREATE TABLE IF NOT EXISTS "music_review_users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "auth_user_id" UUID,
  "email" VARCHAR(255) NOT NULL,
  "nickname" VARCHAR(80) NOT NULL,
  "role" VARCHAR(20) NOT NULL DEFAULT 'member',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "music_review_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "music_review_users_auth_user_id_key"
  ON "music_review_users" ("auth_user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "music_review_users_email_key"
  ON "music_review_users" ("email");

-- 2. Add missing columns to music_reviews
ALTER TABLE "music_reviews"
  ADD COLUMN IF NOT EXISTS "user_id" UUID,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP;

-- 3. Adjust column types to match Prisma schema
ALTER TABLE "music_reviews"
  ALTER COLUMN "posted_at" TYPE DATE USING "posted_at"::date,
  ALTER COLUMN "genre" TYPE VARCHAR(40),
  ALTER COLUMN "genre" DROP NOT NULL,
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "updated_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- 4. Add FK constraint and indexes
ALTER TABLE "music_reviews"
  ADD CONSTRAINT "music_reviews_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "music_review_users" ("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_music_reviews_posted_at"
  ON "music_reviews" ("posted_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_music_reviews_user_id"
  ON "music_reviews" ("user_id");

-- 5. Add missing columns/constraints to music_review_references
ALTER TABLE "music_review_references"
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "music_review_references"
  ALTER COLUMN "updated_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
