-- Step4: initialize music review relational schema for Prisma

CREATE TABLE IF NOT EXISTS "music_review_users" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "auth_user_id" uuid,
  "email" varchar(255) NOT NULL,
  "nickname" varchar(80) NOT NULL,
  "role" varchar(20) NOT NULL DEFAULT 'member',
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "music_review_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "music_review_users_auth_user_id_key"
  ON "music_review_users" ("auth_user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "music_review_users_email_key"
  ON "music_review_users" ("email");

CREATE TABLE IF NOT EXISTS "music_reviews" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid,
  "posted_at" date NOT NULL DEFAULT CURRENT_DATE,
  "author_name" varchar(80) NOT NULL,
  "artist_name" varchar(255) NOT NULL,
  "album_name" varchar(255),
  "track_name" varchar(255),
  "label_name" varchar(255),
  "genre" varchar(40),
  "embed_provider" varchar(40),
  "embed_url" text,
  "body" text NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "music_reviews_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "music_reviews"
  ADD COLUMN IF NOT EXISTS "user_id" uuid,
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "music_reviews"
  ALTER COLUMN "author_name" TYPE varchar(80),
  ALTER COLUMN "artist_name" TYPE varchar(255),
  ALTER COLUMN "album_name" TYPE varchar(255),
  ALTER COLUMN "track_name" TYPE varchar(255),
  ALTER COLUMN "label_name" TYPE varchar(255),
  ALTER COLUMN "genre" TYPE varchar(40),
  ALTER COLUMN "embed_provider" TYPE varchar(40);

CREATE TABLE IF NOT EXISTS "music_review_references" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "review_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "url" text NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "music_review_references_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "music_review_references"
  ADD COLUMN IF NOT EXISTS "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0;

ALTER TABLE "music_review_references"
  ALTER COLUMN "title" TYPE varchar(255);

DO $$
BEGIN
  ALTER TABLE "music_reviews"
    ADD CONSTRAINT "music_reviews_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "music_review_users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "music_review_references"
    ADD CONSTRAINT "music_review_references_review_id_fkey"
    FOREIGN KEY ("review_id") REFERENCES "music_reviews"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "music_reviews"
    ADD CONSTRAINT "music_reviews_embed_pair_check"
    CHECK (
      ("embed_provider" IS NULL AND "embed_url" IS NULL)
      OR ("embed_provider" IS NOT NULL AND "embed_url" IS NOT NULL)
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "music_reviews"
    ADD CONSTRAINT "music_reviews_embed_provider_check"
    CHECK (
      "embed_provider" IS NULL
      OR "embed_provider" IN (
        'Bandcamp',
        'SoundCloud',
        'MixCloud',
        'Beatport',
        'Traxsource',
        'Juno Download',
        'YouTube'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "idx_music_reviews_posted_at"
  ON "music_reviews" ("posted_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_music_reviews_user_id"
  ON "music_reviews" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_music_review_references_review_sort"
  ON "music_review_references" ("review_id", "sort_order");
