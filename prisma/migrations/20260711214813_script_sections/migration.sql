/*
  Warnings:

  - You are about to drop the column `content` on the `script` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "script" DROP COLUMN "content",
ADD COLUMN     "body" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "hook" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "intro" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "outro" TEXT NOT NULL DEFAULT '';
