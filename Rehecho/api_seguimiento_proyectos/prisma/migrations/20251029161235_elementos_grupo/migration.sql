-- AlterTable
ALTER TABLE `grupo` ADD COLUMN `elementos` JSON NULL,
    MODIFY `fase` VARCHAR(191) NOT NULL DEFAULT 'tema';
