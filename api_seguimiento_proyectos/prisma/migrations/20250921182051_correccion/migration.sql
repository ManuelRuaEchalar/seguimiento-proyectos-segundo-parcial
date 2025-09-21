-- CreateTable
CREATE TABLE `Correccion` (
    `id` VARCHAR(191) NOT NULL,
    `contentText` VARCHAR(191) NULL,
    `commentText` VARCHAR(191) NULL,
    `commentEmoji` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NOT NULL,
    `boundingX1` DOUBLE NOT NULL,
    `boundingY1` DOUBLE NOT NULL,
    `boundingX2` DOUBLE NOT NULL,
    `boundingY2` DOUBLE NOT NULL,
    `boundingPage` INTEGER NOT NULL,
    `rects` JSON NOT NULL,
    `observacionId` VARCHAR(191) NOT NULL,
    `codigoDoc` INTEGER NOT NULL,
    `codigoProyecto` INTEGER NOT NULL,

    UNIQUE INDEX `Correccion_observacionId_key`(`observacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Correccion` ADD CONSTRAINT `Correccion_observacionId_fkey` FOREIGN KEY (`observacionId`) REFERENCES `Observacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Correccion` ADD CONSTRAINT `Correccion_codigoDoc_fkey` FOREIGN KEY (`codigoDoc`) REFERENCES `Documento`(`codigoDoc`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Correccion` ADD CONSTRAINT `Correccion_codigoProyecto_fkey` FOREIGN KEY (`codigoProyecto`) REFERENCES `Proyecto`(`codigoProyecto`) ON DELETE RESTRICT ON UPDATE CASCADE;
