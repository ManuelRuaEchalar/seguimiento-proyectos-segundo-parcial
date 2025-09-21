/*
  Warnings:

  - Added the required column `codigoProyecto` to the `Observacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `observacion` ADD COLUMN `codigoProyecto` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Observacion` ADD CONSTRAINT `Observacion_codigoProyecto_fkey` FOREIGN KEY (`codigoProyecto`) REFERENCES `Proyecto`(`codigoProyecto`) ON DELETE RESTRICT ON UPDATE CASCADE;
