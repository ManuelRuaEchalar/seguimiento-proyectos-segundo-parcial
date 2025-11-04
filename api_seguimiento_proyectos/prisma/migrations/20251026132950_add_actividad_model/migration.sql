-- CreateTable
CREATE TABLE `Actividad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `elementos` JSON NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` ENUM('activo', 'cerrado') NOT NULL DEFAULT 'activo',
    `grupo_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Actividad` ADD CONSTRAINT `Actividad_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `Grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
