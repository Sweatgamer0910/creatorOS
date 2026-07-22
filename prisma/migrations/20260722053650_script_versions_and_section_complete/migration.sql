-- AlterTable
ALTER TABLE "script" ADD COLUMN     "bodyComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hookComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "introComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "outroComplete" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "script_version" (
    "id" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "outro" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scriptId" TEXT NOT NULL,

    CONSTRAINT "script_version_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "script_version" ADD CONSTRAINT "script_version_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "script"("id") ON DELETE CASCADE ON UPDATE CASCADE;
