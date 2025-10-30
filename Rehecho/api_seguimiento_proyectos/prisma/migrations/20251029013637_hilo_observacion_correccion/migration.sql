/*
  Warnings:

  - A unique constraint covering the columns `[correccion_id]` on the table `Observacion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `observacion` ADD COLUMN `correccion_id` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Observacion_correccion_id_key` ON `Observacion`(`correccion_id`);

-- AddForeignKey
ALTER TABLE `Observacion` ADD CONSTRAINT `Observacion_correccion_id_fkey` FOREIGN KEY (`correccion_id`) REFERENCES `Correccion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
