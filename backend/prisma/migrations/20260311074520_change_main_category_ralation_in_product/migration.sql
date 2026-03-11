/*
  Warnings:

  - You are about to drop the column `mainCategoryId` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mainCategoryName]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_mainCategoryId_fkey";

-- DropIndex
DROP INDEX "Product_mainCategoryId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "mainCategoryId",
ADD COLUMN     "mainCategoryName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_mainCategoryName_key" ON "Product"("mainCategoryName");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_mainCategoryName_fkey" FOREIGN KEY ("mainCategoryName") REFERENCES "Category"("name") ON DELETE SET NULL ON UPDATE CASCADE;
