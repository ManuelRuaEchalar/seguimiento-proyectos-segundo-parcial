/*
  Warnings:

  - You are about to drop the column `grupo_id` on the `docente` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `usuario` table. All the data in the column will be lost.
  - Added the required column `especialidad` to the `Docente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grado` to the `Grupo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `docente` DROP FOREIGN KEY `Docente_grupo_id_fkey`;

-- DropIndex
DROP INDEX `Docente_grupo_id_fkey` ON `docente`;

-- AlterTable
ALTER TABLE `docente` DROP COLUMN `grupo_id`,
    ADD COLUMN `especialidad` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `estudiante` ADD COLUMN `proyecto_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `grupo` ADD COLUMN `docente_id` INTEGER NULL,
    ADD COLUMN `grado` ENUM('grado1', 'grado2') NOT NULL;

-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `refreshToken`,
    ADD COLUMN `refresh_token` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Proyecto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `fase_actual` ENUM('tema', 'perfil', 'proyecto', 'predefensa', 'finalizado') NOT NULL,
    `grado_actual` ENUM('grado1', 'grado2') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Documento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `estado` ENUM('pendiente', 'en_revision', 'revisado', 'aprobado', 'rechazado') NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `file` VARCHAR(191) NOT NULL,
    `proyecto_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Observacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content_text` VARCHAR(191) NULL,
    `comment_text` VARCHAR(191) NULL,
    `comment_emoji` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NOT NULL,
    `bounding_x1` DOUBLE NOT NULL,
    `bounding_y1` DOUBLE NOT NULL,
    `bounding_x2` DOUBLE NOT NULL,
    `bounding_y2` DOUBLE NOT NULL,
    `bounding_page` INTEGER NOT NULL,
    `rects` JSON NOT NULL,
    `documento_id` INTEGER NOT NULL,
    `proyecto_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Correccion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content_text` VARCHAR(191) NULL,
    `comment_text` VARCHAR(191) NULL,
    `comment_emoji` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NOT NULL,
    `bounding_x1` DOUBLE NOT NULL,
    `bounding_y1` DOUBLE NOT NULL,
    `bounding_x2` DOUBLE NOT NULL,
    `bounding_y2` DOUBLE NOT NULL,
    `bounding_page` INTEGER NOT NULL,
    `rects` JSON NOT NULL,
    `observacion_id` INTEGER NOT NULL,
    `documento_id` INTEGER NOT NULL,

    UNIQUE INDEX `Correccion_observacion_id_key`(`observacion_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Grupo` ADD CONSTRAINT `Grupo_docente_id_fkey` FOREIGN KEY (`docente_id`) REFERENCES `Docente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documento` ADD CONSTRAINT `Documento_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Observacion` ADD CONSTRAINT `Observacion_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Observacion` ADD CONSTRAINT `Observacion_documento_id_fkey` FOREIGN KEY (`documento_id`) REFERENCES `Documento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Correccion` ADD CONSTRAINT `Correccion_observacion_id_fkey` FOREIGN KEY (`observacion_id`) REFERENCES `Observacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Correccion` ADD CONSTRAINT `Correccion_documento_id_fkey` FOREIGN KEY (`documento_id`) REFERENCES `Documento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
