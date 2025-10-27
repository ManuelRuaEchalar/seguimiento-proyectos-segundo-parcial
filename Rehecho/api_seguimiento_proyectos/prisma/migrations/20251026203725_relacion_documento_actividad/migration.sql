/*
  Warnings:

  - You are about to drop the column `activo` on the `documento` table. All the data in the column will be lost.
  - You are about to drop the column `fase` on the `documento` table. All the data in the column will be lost.
  - Added the required column `actividad_id` to the `Documento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `documento` DROP COLUMN `activo`,
    DROP COLUMN `fase`,
    ADD COLUMN `actividad_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_actividad_id_fkey` FOREIGN KEY (`actividad_id`) REFERENCES `Actividad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
