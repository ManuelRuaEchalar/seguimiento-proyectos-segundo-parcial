/*
  Warnings:

  - Added the required column `actividad_id` to the `Final` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `final` ADD COLUMN `actividad_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Final` ADD CONSTRAINT `Final_actividad_id_fkey` FOREIGN KEY (`actividad_id`) REFERENCES `Actividad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
