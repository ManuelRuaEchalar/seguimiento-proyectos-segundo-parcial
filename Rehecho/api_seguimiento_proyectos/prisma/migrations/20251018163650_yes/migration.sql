/*
  Warnings:

  - The values [predefensa,finalizado] on the enum `Documento_fase` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `fase` to the `Documento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `documento` ADD COLUMN `fase` ENUM('tema', 'perfil', 'proyecto') NOT NULL;

-- AlterTable
ALTER TABLE `proyecto` MODIFY `fase_actual` ENUM('tema', 'perfil', 'proyecto') NOT NULL;
