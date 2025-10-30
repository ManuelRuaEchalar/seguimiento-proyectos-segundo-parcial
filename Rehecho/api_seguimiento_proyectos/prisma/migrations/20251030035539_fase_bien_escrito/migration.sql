/*
  Warnings:

  - You are about to drop the column `fase_actual` on the `actividad` table. All the data in the column will be lost.
  - Added the required column `fas` to the `Actividad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `actividad` DROP COLUMN `fase_actual`,
    ADD COLUMN `fas` ENUM('tema', 'perfil', 'proyecto') NOT NULL;
