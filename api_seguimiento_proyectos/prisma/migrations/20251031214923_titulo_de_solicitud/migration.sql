/*
  Warnings:

  - Added the required column `titulo` to the `Solicitud` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `solicitud` ADD COLUMN `titulo` VARCHAR(191) NOT NULL;
