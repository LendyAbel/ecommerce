/*
  Warnings:

  - You are about to drop the column `mainCategoryName` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_mainCategoryName_fkey";

-- DropIndex
DROP INDEX "Product_mainCategoryName_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "mainCategoryName",
ADD COLUMN     "mainCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
