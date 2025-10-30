-- CreateTable
CREATE TABLE `Final` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `carrera` VARCHAR(191) NOT NULL,
    `año` INTEGER NOT NULL,
    `estado` ENUM('aprobado', 'rechazado', 'pendiente') NOT NULL DEFAULT 'pendiente',
    `archivo` VARCHAR(191) NOT NULL,
    `fase` ENUM('perfil', 'proyecto', 'tesis') NOT NULL,
    `proyecto_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Tag_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_FinalTags` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_FinalTags_AB_unique`(`A`, `B`),
    INDEX `_FinalTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Final` ADD CONSTRAINT `Final_proyecto_id_fkey` FOREIGN KEY (`proyecto_id`) REFERENCES `Proyecto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FinalTags` ADD CONSTRAINT `_FinalTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `Final`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FinalTags` ADD CONSTRAINT `_FinalTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
