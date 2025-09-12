/*
  Warnings:

  - A unique constraint covering the columns `[proyectoId]` on the table `Estudiante` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `estudiante` ADD COLUMN `proyectoId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Proyecto` (
    `codigoProyecto` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`codigoProyecto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Documento` (
    `codigoDoc` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `file` VARCHAR(191) NOT NULL,
    `proyectoId` INTEGER NOT NULL,

    PRIMARY KEY (`codigoDoc`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Estudiante_proyectoId_key` ON `Estudiante`(`proyectoId`);

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `Proyecto`(`codigoProyecto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_proyectoId_fkey` FOREIGN KEY (`proyectoId`) REFERENCES `Proyecto`(`codigoProyecto`) ON DELETE SET NULL ON UPDATE CASCADE;
