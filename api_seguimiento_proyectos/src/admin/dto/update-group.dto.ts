import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Grado } from '@prisma/client';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsEnum(Grado)
  grado?: Grado;

  @IsOptional()
  @IsNumber()
  docente_id?: number;
}
