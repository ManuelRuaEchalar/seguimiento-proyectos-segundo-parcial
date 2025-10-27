-- AlterTable
ALTER TABLE `grupo` ADD COLUMN `fase` VARCHAR(191) NOT NULL DEFAULT 'Inicial',
    ADD COLUMN `fecha_ultima_actividad` DATETIME(3) NULL,
    ADD COLUMN `total_actividades` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_estudiantes` INTEGER NOT NULL DEFAULT 0;
