-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organizerId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
