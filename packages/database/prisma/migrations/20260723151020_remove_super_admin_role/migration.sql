-- Remove the SUPER_ADMIN role: CLIENT_ADMIN is now the sole admin role.
-- Postgres has no ALTER TYPE ... DROP VALUE, so the enum is recreated.

-- Reassign any existing SUPER_ADMIN users to CLIENT_ADMIN before the value
-- is dropped from the enum, so no row is left pointing at a removed value.
UPDATE "users" SET "role" = 'CLIENT_ADMIN' WHERE "role" = 'SUPER_ADMIN';

ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('CLIENT_ADMIN', 'SALES_EXECUTIVE', 'MARKETING_MANAGER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'SALES_EXECUTIVE';
DROP TYPE "UserRole_old";
