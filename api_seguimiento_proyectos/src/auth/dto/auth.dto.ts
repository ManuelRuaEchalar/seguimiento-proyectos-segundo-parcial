import { IsEmail, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export enum Rol {
  admin = 'admin',
  docente = 'docente',
  estudiante = 'estudiante',
}

export class AuthDto {
  // ----------- Usuario -----------
  @IsOptional()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  apellido: string;

  @IsEmail()
  email: string;

  @IsString()
  contraseña: string;

  @IsOptional()
  @IsEnum(Rol)
  rol: Rol;

  // ----------- Estudiante (opcionales) -----------
  @IsOptional()
  @IsString()
  cu?: string;

  @IsOptional()
  @IsString()
  carrera?: string;

  @IsOptional()
  @IsInt()
  grupo_id?: number;

  // ----------- Docente (opcionales) -----------
  @IsOptional()
  @IsInt()
  id_grupo?: number;
    @IsOptional()
  @IsInt()
  codigo_docente?: number;
}
