import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CampsService } from './camps.service';
import { CreateCampDto } from './dto/create-camp.dto';
import { UpdateCampDto } from './dto/update-camp.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('Campamentos')
@Controller({ path: 'camps', version: '1' })
export class CampsController {
  constructor(private readonly campsService: CampsService) {}

  // crear campamentos
  @Post()
  @Roles('admin')
  @ApiOperation({
    summary: 'Crear campamento',
    description:
      'Crea un nuevo campamento e inicializa su inventario vacío con todos los recursos existentes.',
  })
  @ApiResponse({ status: 201, description: 'Campamento creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'Sin permiso.' })
  create(@Body() dto: CreateCampDto) {
    return this.campsService.create(dto);
  }

  //ver la lista
  @Get()
  @ApiOperation({
    summary: 'Listar campamentos activos',
    description: 'Retorna todos los campamentos con estado activo.',
  })
  @ApiResponse({ status: 200, description: 'Lista de campamentos.' })
  findAll() {
    return this.campsService.findAll();
  }

  // ver el detalle
  @Get(':id')
  @ApiOperation({
    summary: 'Detalle de campamento',
    description: 'Retorna el campamento con sus métricas de inventario.',
  })
  @ApiParam({ name: 'id', description: 'ID del campamento', type: Number })
  @ApiResponse({ status: 200, description: 'Detalle del campamento.' })
  @ApiResponse({ status: 404, description: 'Campamento no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.campsService.findOne(id);
  }

  // editar campamentos
  @Patch(':id')
  @Roles('admin')
  @ApiOperation({
    summary: 'Actualizar campamento',
    description: 'Actualiza los datos de un campamento existente.',
  })
  @ApiParam({ name: 'id', description: 'ID del campamento', type: Number })
  @ApiResponse({ status: 200, description: 'Campamento actualizado.' })
  @ApiResponse({ status: 404, description: 'Campamento no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampDto,
  ) {
    return this.campsService.update(id, dto);
  }

  // desactivar campamentos
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar campamento',
    description: 'Desactiva el campamento (soft delete). No elimina los datos.',
  })
  @ApiParam({ name: 'id', description: 'ID del campamento', type: Number })
  @ApiResponse({ status: 200, description: 'Campamento desactivado.' })
  @ApiResponse({ status: 404, description: 'Campamento no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.campsService.remove(id);
  }
}
