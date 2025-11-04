import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Grado } from '@prisma/client';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(Grado)
  grado: Grado;

  @IsOptional()
  @IsNumber()
  docente_id?: number;
}
