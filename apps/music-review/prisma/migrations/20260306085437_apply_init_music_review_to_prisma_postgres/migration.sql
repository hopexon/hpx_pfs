-- AlterTable
ALTER TABLE "music_review_references" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "music_review_users" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "music_reviews" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "posted_at" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;
