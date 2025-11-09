-- CreateEnum
CREATE TYPE "public"."TipoSolicitud" AS ENUM ('unirse', 'invitar');

-- CreateEnum
CREATE TYPE "public"."EstadoSolicitud" AS ENUM ('pendiente', 'aceptado', 'rechazado');

-- CreateEnum
CREATE TYPE "public"."EstadoFinal" AS ENUM ('aprobado', 'rechazado', 'pendiente');

-- CreateEnum
CREATE TYPE "public"."FaseFinal" AS ENUM ('perfil', 'proyecto', 'tesis');

-- CreateEnum
CREATE TYPE "public"."EstadoActividad" AS ENUM ('activo', 'cerrado');

-- CreateEnum
CREATE TYPE "public"."Rol" AS ENUM ('admin', 'docente', 'estudiante');

-- CreateEnum
CREATE TYPE "public"."Grado" AS ENUM ('grado1', 'grado2');

-- CreateEnum
CREATE TYPE "public"."FaseProyecto" AS ENUM ('tema', 'perfil', 'proyecto');

-- CreateEnum
CREATE TYPE "public"."EstadoDocumento" AS ENUM ('pendiente', 'en_revision', 'revisado', 'aprobado', 'rechazado');

-- CreateTable
CREATE TABLE "public"."Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "rol" "public"."Rol" NOT NULL,
    "refresh_token" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Grupo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "grado" "public"."Grado" NOT NULL,
    "docente_id" INTEGER,
    "total_actividades" INTEGER NOT NULL DEFAULT 0,
    "total_estudiantes" INTEGER NOT NULL DEFAULT 0,
    "fase" TEXT NOT NULL DEFAULT 'tema',
    "elementos" JSONB,
    "elementos_hechos" JSONB,
    "fecha_ultima_actividad" TIMESTAMP(3),
    "fecha_inicio_tema" TIMESTAMP(3),
    "fecha_fin_tema" TIMESTAMP(3),
    "fecha_inicio_perfil" TIMESTAMP(3),
    "fecha_fin_perfil" TIMESTAMP(3),
    "fecha_inicio_proyecto" TIMESTAMP(3),
    "fecha_fin_proyecto" TIMESTAMP(3),

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Estudiante" (
    "id" INTEGER NOT NULL,
    "cu" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,
    "grupo_id" INTEGER,
    "grupo_dos_id" INTEGER,
    "proyecto_id" INTEGER,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Proyecto" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT,
    "fase_actual" "public"."FaseProyecto" NOT NULL,
    "grado_actual" "public"."Grado" NOT NULL,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Documento" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "estado" "public"."EstadoDocumento" NOT NULL,
    "justificacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file" TEXT NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "actividad_id" INTEGER NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Observacion" (
    "id" SERIAL NOT NULL,
    "content_text" TEXT,
    "comment_text" TEXT,
    "comment_emoji" TEXT,
    "estado" TEXT NOT NULL,
    "bounding_x1" DOUBLE PRECISION NOT NULL,
    "bounding_y1" DOUBLE PRECISION NOT NULL,
    "bounding_x2" DOUBLE PRECISION NOT NULL,
    "bounding_y2" DOUBLE PRECISION NOT NULL,
    "bounding_page" INTEGER NOT NULL,
    "rects" JSONB NOT NULL,
    "correccion_id" INTEGER,
    "documento_id" INTEGER NOT NULL,
    "proyecto_id" INTEGER NOT NULL,

    CONSTRAINT "Observacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Correccion" (
    "id" SERIAL NOT NULL,
    "content_text" TEXT,
    "comment_text" TEXT,
    "comment_emoji" TEXT,
    "estado" TEXT NOT NULL,
    "bounding_x1" DOUBLE PRECISION NOT NULL,
    "bounding_y1" DOUBLE PRECISION NOT NULL,
    "bounding_x2" DOUBLE PRECISION NOT NULL,
    "bounding_y2" DOUBLE PRECISION NOT NULL,
    "bounding_page" INTEGER NOT NULL,
    "rects" JSONB NOT NULL,
    "observacion_id" INTEGER NOT NULL,
    "documento_id" INTEGER NOT NULL,

    CONSTRAINT "Correccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Docente" (
    "id" INTEGER NOT NULL,
    "especialidad" TEXT NOT NULL,

    CONSTRAINT "Docente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Actividad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "elementos" JSONB NOT NULL,
    "descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "public"."EstadoActividad" NOT NULL DEFAULT 'activo',
    "fase" "public"."FaseProyecto" NOT NULL,
    "es_final" BOOLEAN NOT NULL DEFAULT false,
    "grupo_id" INTEGER NOT NULL,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Solicitud" (
    "id" SERIAL NOT NULL,
    "tipo" "public"."TipoSolicitud" NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "emisor_id" INTEGER NOT NULL,
    "receptor_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "aprobacion_receptor" "public"."EstadoSolicitud" NOT NULL DEFAULT 'pendiente',
    "aprobacion_docente" "public"."EstadoSolicitud" NOT NULL DEFAULT 'pendiente',
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Final" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,
    "año" INTEGER NOT NULL,
    "estado" "public"."EstadoFinal" NOT NULL DEFAULT 'pendiente',
    "archivo" TEXT NOT NULL,
    "fase" "public"."FaseFinal" NOT NULL,
    "version" INTEGER NOT NULL,
    "motivo_rechazo" TEXT,
    "proyecto_id" INTEGER NOT NULL,
    "actividad_id" INTEGER NOT NULL,

    CONSTRAINT "Final_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_FinalTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FinalTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "public"."Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Observacion_correccion_id_key" ON "public"."Observacion"("correccion_id");

-- CreateIndex
CREATE UNIQUE INDEX "Correccion_observacion_id_key" ON "public"."Correccion"("observacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_nombre_key" ON "public"."Tag"("nombre");

-- CreateIndex
CREATE INDEX "_FinalTags_B_index" ON "public"."_FinalTags"("B");

-- AddForeignKey
ALTER TABLE "public"."Grupo" ADD CONSTRAINT "Grupo_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "public"."Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Estudiante" ADD CONSTRAINT "Estudiante_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Estudiante" ADD CONSTRAINT "Estudiante_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "public"."Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Estudiante" ADD CONSTRAINT "Estudiante_grupo_dos_id_fkey" FOREIGN KEY ("grupo_dos_id") REFERENCES "public"."Grupo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Estudiante" ADD CONSTRAINT "Estudiante_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."Proyecto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Documento" ADD CONSTRAINT "Documento_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Documento" ADD CONSTRAINT "Documento_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "public"."Actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Observacion" ADD CONSTRAINT "Observacion_correccion_id_fkey" FOREIGN KEY ("correccion_id") REFERENCES "public"."Correccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Observacion" ADD CONSTRAINT "Observacion_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Observacion" ADD CONSTRAINT "Observacion_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."Documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Correccion" ADD CONSTRAINT "Correccion_observacion_id_fkey" FOREIGN KEY ("observacion_id") REFERENCES "public"."Observacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Correccion" ADD CONSTRAINT "Correccion_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."Documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Docente" ADD CONSTRAINT "Docente_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Actividad" ADD CONSTRAINT "Actividad_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "public"."Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Solicitud" ADD CONSTRAINT "Solicitud_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Solicitud" ADD CONSTRAINT "Solicitud_emisor_id_fkey" FOREIGN KEY ("emisor_id") REFERENCES "public"."Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Solicitud" ADD CONSTRAINT "Solicitud_receptor_id_fkey" FOREIGN KEY ("receptor_id") REFERENCES "public"."Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Final" ADD CONSTRAINT "Final_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "public"."Proyecto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Final" ADD CONSTRAINT "Final_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "public"."Actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FinalTags" ADD CONSTRAINT "_FinalTags_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Final"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FinalTags" ADD CONSTRAINT "_FinalTags_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
