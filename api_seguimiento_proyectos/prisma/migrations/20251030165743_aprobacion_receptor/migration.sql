/*
  Warnings:

  - You are about to drop the column `estado` on the `solicitud` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `solicitud` DROP COLUMN `estado`,
    ADD COLUMN `aprobacion_receptor` ENUM('pendiente', 'aceptado', 'rechazado') NOT NULL DEFAULT 'pendiente';
