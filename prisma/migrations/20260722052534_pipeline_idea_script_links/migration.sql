-- AlterTable
ALTER TABLE "content_item" ADD COLUMN     "ideaId" TEXT,
ADD COLUMN     "scriptId" TEXT;

-- AddForeignKey
ALTER TABLE "content_item" ADD CONSTRAINT "content_item_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "idea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_item" ADD CONSTRAINT "content_item_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "script"("id") ON DELETE SET NULL ON UPDATE CASCADE;
