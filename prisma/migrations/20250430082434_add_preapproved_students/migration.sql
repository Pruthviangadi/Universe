/*
  Warnings:

  - A unique constraint covering the columns `[usn]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "usn" TEXT;

-- CreateTable
CREATE TABLE "PreApprovedStudent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "usn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreApprovedStudent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreApprovedStudent_email_key" ON "PreApprovedStudent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PreApprovedStudent_usn_key" ON "PreApprovedStudent"("usn");

-- CreateIndex
CREATE UNIQUE INDEX "Users_usn_key" ON "Users"("usn");
