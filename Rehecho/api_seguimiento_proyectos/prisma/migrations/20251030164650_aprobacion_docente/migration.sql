-- AlterTable
ALTER TABLE `solicitud` ADD COLUMN `aprobacion_docente` ENUM('pendiente', 'aceptado', 'rechazado') NOT NULL DEFAULT 'pendiente';
