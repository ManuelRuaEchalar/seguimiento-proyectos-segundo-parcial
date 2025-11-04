import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Rol } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Rol)
  rol: Rol;

  @IsString()
  cu?: string;

  @IsString()
  carrera?: string;

  @IsString()
  especialidad?: string;
}
