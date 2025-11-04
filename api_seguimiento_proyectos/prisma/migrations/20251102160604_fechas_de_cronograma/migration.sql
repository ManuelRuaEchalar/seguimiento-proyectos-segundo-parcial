-- AlterTable
ALTER TABLE `grupo` ADD COLUMN `fecha_fin_perfil` DATETIME(3) NULL,
    ADD COLUMN `fecha_fin_proyecto` DATETIME(3) NULL,
    ADD COLUMN `fecha_fin_tema` DATETIME(3) NULL,
    ADD COLUMN `fecha_inicio_perfil` DATETIME(3) NULL,
    ADD COLUMN `fecha_inicio_proyecto` DATETIME(3) NULL,
    ADD COLUMN `fecha_inicio_tema` DATETIME(3) NULL;
