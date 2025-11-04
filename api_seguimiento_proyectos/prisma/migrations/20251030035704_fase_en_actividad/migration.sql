/*
  Warnings:

  - You are about to drop the column `fas` on the `actividad` table. All the data in the column will be lost.
  - Added the required column `fase` to the `Actividad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `actividad` DROP COLUMN `fas`,
    ADD COLUMN `fase` ENUM('tema', 'perfil', 'proyecto') NOT NULL;
