-- DropForeignKey
ALTER TABLE `estudiante` DROP FOREIGN KEY `Estudiante_grupo_id_fkey`;

-- DropIndex
DROP INDEX `Estudiante_grupo_id_fkey` ON `estudiante`;

-- AlterTable
ALTER TABLE `estudiante` MODIFY `grupo_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `Grupo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
