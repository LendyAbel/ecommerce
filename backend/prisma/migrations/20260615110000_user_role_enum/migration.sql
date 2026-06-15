-- Normalize any legacy role values before converting to the enum type.
UPDATE "User" SET "role" = 'customer' WHERE "role" NOT IN ('admin', 'customer');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'customer');

-- AlterTable: convert User.role from text to the UserRole enum.
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'customer';
