import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { UpdatePersonStatusDto } from './dto/update-person-status.dto';
import { CreateTemporaryAssignmentDto } from './dto/create-temporary-assignment.dto';
import { CreateProfessionDto } from './dto/create-profession.dto';

@ApiTags('Users & Persons')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==================== PERSONS ====================

  @Get('persons')
  @Roles('admin', 'gestor_recursos', 'encargado_viajes')
  @ApiOperation({ summary: 'Obtener todas las personas del campamento' })
  @ApiQuery({ name: 'campId', required: false, description: 'Filtrar por campamento' })
  async getAllPersons(@Query('campId') campId?: string) {
    return this.usersService.findAllPersons(campId ? parseInt(campId) : undefined);
  }

  @Get('persons/:id')
  @Roles('admin', 'gestor_recursos', 'encargado_viajes', 'trabajador')
  @ApiOperation({ summary: 'Obtener una persona por ID' })
  async getPersonById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findPersonById(id);
  }

  @Post('persons')
  @Roles('admin')
  @ApiOperation({ summary: 'Crear una nueva persona (después de admisión)' })
  async createPerson(@Body() dto: CreatePersonDto) {
    return this.usersService.createPerson(dto);
  }

  @Put('persons/:id')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Actualizar información de una persona' })
  async updatePerson(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePersonDto) {
    return this.usersService.updatePerson(id, dto);
  }

  @Put('persons/:id/status')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Cambiar estado de una persona (enfermo, herido, etc.)' })
  async updatePersonStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonStatusDto,
  ) {
    return this.usersService.updatePersonStatus(id, dto);
  }

  @Delete('persons/:id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una persona' })
  async deletePerson(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deletePerson(id);
  }

  @Get('persons/stats/by-status')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Estadísticas de personas por estado' })
  @ApiQuery({ name: 'campId', required: false, description: 'Filtrar por campamento' })
  async getPersonStatsByStatus(@Query('campId') campId?: string) {
    return this.usersService.getPersonStatsByStatus(campId ? parseInt(campId) : undefined);
  }

  @Get('persons/stats/by-profession')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Estadísticas de personas por profesión' })
  @ApiQuery({ name: 'campId', required: false, description: 'Filtrar por campamento' })
  async getPersonStatsByProfession(@Query('campId') campId?: string) {
    return this.usersService.getPersonStatsByProfession(campId ? parseInt(campId) : undefined);
  }

  // ==================== PROFESSIONS ====================

  @Get('professions')
  @ApiOperation({ summary: 'Obtener todas las profesiones' })
  async getAllProfessions() {
    return this.usersService.findAllProfessions();
  }

  @Get('professions/:id')
  @ApiOperation({ summary: 'Obtener una profesión por ID' })
  async getProfessionById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findProfessionById(id);
  }

  @Post('professions')
  @Roles('admin')
  @ApiOperation({ summary: 'Crear una nueva profesión' })
  async createProfession(@Body() dto: CreateProfessionDto) {
    return this.usersService.createProfession(dto);
  }

  @Get('professions/alerts/needing-workers')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Obtener profesiones que necesitan trabajadores urgentemente' })
  async getProfessionsNeedingWorkers() {
    return this.usersService.getProfessionsNeedingWorkers();
  }

  @Get('professions/alerts/with-excess')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Obtener profesiones con exceso de trabajadores' })
  async getProfessionsWithExcess() {
    return this.usersService.getProfessionsWithExcess();
  }

  // ==================== TEMPORARY ASSIGNMENTS ====================

  @Post('temporary-assignments')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Crear asignación temporal (debe ser aprobada después)' })
  async createTemporaryAssignment(
    @Body() dto: CreateTemporaryAssignmentDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.createTemporaryAssignment(dto, user.id);
  }

  @Get('temporary-assignments')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Obtener asignaciones temporales activas' })
  @ApiQuery({ name: 'campId', required: false, description: 'Filtrar por campamento' })
  async getActiveTemporaryAssignments(@Query('campId') campId?: string) {
    return this.usersService.getActiveTemporaryAssignments(
      campId ? parseInt(campId) : undefined,
    );
  }

  @Put('temporary-assignments/:id/end')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Finalizar asignación temporal (devolver a profesión original)' })
  async endTemporaryAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.endTemporaryAssignment(id);
  }

  // ==================== PRODUCTION & CONSUMPTION ====================

  @Get('camp/:campId/production')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Calcular producción diaria del campamento' })
  async getDailyProduction(@Param('campId', ParseIntPipe) campId: number) {
    return this.usersService.calculateDailyProduction(campId);
  }

  @Get('camp/:campId/consumption')
  @Roles('admin', 'gestor_recursos')
  @ApiOperation({ summary: 'Calcular consumo diario del campamento' })
  async getDailyConsumption(@Param('campId', ParseIntPipe) campId: number) {
    return this.usersService.calculateDailyConsumption(campId);
  }

  @Get('camp/:campId/balance')
  @Roles('admin', 'gestor_recursos', 'trabajador')
  @ApiOperation({ summary: 'Calcular balance diario (producción - consumo)' })
  async getDailyBalance(@Param('campId', ParseIntPipe) campId: number) {
    return this.usersService.calculateDailyBalance(campId);
  }
}
