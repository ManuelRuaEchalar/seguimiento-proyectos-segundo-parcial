-- CreateTable
CREATE TABLE `Solicitud` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('unirse', 'invitar') NOT NULL,
    `proyecto_id` INTEGER NOT NULL,
    `emisor_id` INTEGER NOT NULL,
    `receptor_id` INTEGER NOT NULL,
    `estado` ENUM('pendiente', 'aceptado', 'rechazado') NOT NULL DEFAULT 'pendiente',
    `fecha_envio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_emisor_id_fkey` FOREIGN KEY (`emisor_id`) REFERENCES `Estudiante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_receptor_id_fkey` FOREIGN KEY (`receptor_id`) REFERENCES `Estudiante`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
