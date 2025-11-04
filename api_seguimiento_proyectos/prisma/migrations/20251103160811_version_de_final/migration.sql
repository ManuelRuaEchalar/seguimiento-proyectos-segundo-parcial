/*
  Warnings:

  - Added the required column `version` to the `Final` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `final` ADD COLUMN `version` INTEGER NOT NULL;
