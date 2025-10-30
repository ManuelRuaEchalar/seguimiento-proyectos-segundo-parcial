/*
  Warnings:

  - Added the required column `fase_actual` to the `Actividad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `actividad` ADD COLUMN `fase_actual` ENUM('tema', 'perfil', 'proyecto') NOT NULL;
