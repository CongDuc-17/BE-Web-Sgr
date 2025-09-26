-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "refresh_token" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "users_refresh_token_idx" ON "public"."users"("refresh_token");
