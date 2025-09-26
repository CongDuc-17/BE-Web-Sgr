-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" VARCHAR(255),
    "provider" VARCHAR(255) DEFAULT 'local',
    "providerId" VARCHAR(255),
    "name" VARCHAR(255),
    "bio" VARCHAR(255),
    "address" VARCHAR(255),
    "avatarUrl" VARCHAR(255),
    "isActive" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "refresh_token" VARCHAR(255),
    "reset_otp" VARCHAR(255),
    "otp_expiry" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");
