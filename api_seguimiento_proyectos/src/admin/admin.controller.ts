import {
  Controller,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AdminGuard } from '../auth/guard/admin.guard';
import { JwtGuard } from '../auth/guard/jwt.guard';

@Controller('admin')
@UseGuards(JwtGuard, AdminGuard) // Aplica JwtGuard primero
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('users')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(+id, updateUserDto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(+id);
  }

  @Post('grupos')
  createGroup(@Body() createGroupDto: CreateGroupDto) {
    return this.adminService.createGroup(createGroupDto);
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('grupos')
  getGroups() {
    return this.adminService.getGroups();
  }
  @Put('grupos/:id')
  updateGroup(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.adminService.updateGroup(+id, updateGroupDto);
  }
  @Delete('grupos/:id/docente')
  removeDocenteFromGroup(@Param('id') id: string) {
    return this.adminService.removeDocenteFromGroup(+id);
  }
  @Delete('grupos/:id')
  deleteGroup(@Param('id') id: string) {
    return this.adminService.deleteGroup(+id);
  }
  @Get('docentes')
  getDocentes() {
    return this.adminService.getDocentes();
  }

  @Put('grupos/:id/asignar-docente')
  assignDocenteToGroup(
    @Param('id') id: string,
    @Body('docente_id') docenteId: string,
  ) {
    return this.adminService.assignDocenteToGroup(+id, +docenteId);
  }

  @Delete('grupos/:id/estudiantes/:estudianteId')
  removeEstudianteFromGroup(
    @Param('id') id: string,
    @Param('estudianteId') estudianteId: string,
  ) {
    return this.adminService.removeEstudianteFromGroup(+id, +estudianteId);
  }

  @Get('estudiantes')
  getEstudiantes() {
    return this.adminService.getEstudiantes();
  }

  @Put('grupos/:id/asignar-estudiante')
  assignEstudianteToGroup(
    @Param('id') id: string,
    @Body('estudiante_id') estudianteId: string,
  ) {
    return this.adminService.assignEstudianteToGroup(+id, +estudianteId);
  }
}
