import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Rol } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(Rol)
  @IsOptional()
  rol?: Rol;

  @IsString()
  @IsOptional()
  cu?: string;

  @IsString()
  @IsOptional()
  carrera?: string;

  @IsString()
  @IsOptional()
  especialidad?: string;
}
