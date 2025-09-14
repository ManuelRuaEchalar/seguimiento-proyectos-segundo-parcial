-- CreateTable
CREATE TABLE `Observacion` (
    `id` VARCHAR(191) NOT NULL,
    `contentText` VARCHAR(191) NOT NULL,
    `commentText` VARCHAR(191) NULL,
    `commentEmoji` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NOT NULL,
    `boundingX1` DOUBLE NOT NULL,
    `boundingY1` DOUBLE NOT NULL,
    `boundingX2` DOUBLE NOT NULL,
    `boundingY2` DOUBLE NOT NULL,
    `boundingPage` INTEGER NOT NULL,
    `rects` JSON NOT NULL,
    `codigoDoc` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Observacion` ADD CONSTRAINT `Observacion_codigoDoc_fkey` FOREIGN KEY (`codigoDoc`) REFERENCES `Documento`(`codigoDoc`) ON DELETE RESTRICT ON UPDATE CASCADE;
