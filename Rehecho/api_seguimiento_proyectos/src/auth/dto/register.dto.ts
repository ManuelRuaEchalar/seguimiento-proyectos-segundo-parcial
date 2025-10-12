import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Rol } from '@prisma/client';

export class RegisterDto {
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

  @IsEnum(Rol, { message: 'Rol debe ser estudiante' })
  rol: Rol = Rol.estudiante;

  @IsString()
  cu: string;

  @IsString()
  carrera: string;
}
