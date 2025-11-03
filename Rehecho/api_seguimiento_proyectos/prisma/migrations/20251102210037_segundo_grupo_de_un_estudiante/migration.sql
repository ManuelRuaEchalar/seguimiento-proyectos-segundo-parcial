-- AlterTable
ALTER TABLE `estudiante` ADD COLUMN `grupo_dos_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Estudiante` ADD CONSTRAINT `Estudiante_grupo_dos_id_fkey` FOREIGN KEY (`grupo_dos_id`) REFERENCES `Grupo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
