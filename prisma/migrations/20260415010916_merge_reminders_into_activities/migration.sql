-- CreateEnum: ActivityPriority
CREATE TYPE "ActivityPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum: ActivityStatus
CREATE TYPE "ActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterEnum: Add REMINDER to ActivityType
ALTER TYPE "ActivityType" ADD VALUE 'REMINDER';

-- AlterTable: Add reminder-specific fields to Activity
ALTER TABLE "Activity" ADD COLUMN "dueDate" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN "priority" "ActivityPriority";
ALTER TABLE "Activity" ADD COLUMN "status" "ActivityStatus";

-- Migrate data: Copy Reminder rows into Activity
INSERT INTO "Activity" ("id", "dealId", "contactId", "companyId", "type", "subject", "description", "date", "dueDate", "priority", "status", "createdAt", "updatedAt")
SELECT
  "id",
  "dealId",
  "contactId",
  "companyId",
  'REMINDER'::"ActivityType",
  "title",
  "description",
  "createdAt",
  "dueDate",
  "priority"::text::"ActivityPriority",
  "status"::text::"ActivityStatus",
  "createdAt",
  "updatedAt"
FROM "Reminder";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT IF EXISTS "Reminder_companyId_fkey";
ALTER TABLE "Reminder" DROP CONSTRAINT IF EXISTS "Reminder_contactId_fkey";
ALTER TABLE "Reminder" DROP CONSTRAINT IF EXISTS "Reminder_dealId_fkey";

-- DropTable
DROP TABLE "Reminder";

-- DropEnum
DROP TYPE "ReminderPriority";
DROP TYPE "ReminderStatus";
