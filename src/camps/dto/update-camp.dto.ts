import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCampDto } from './create-camp.dto';

export class UpdateCampDto extends PartialType(CreateCampDto) {
  @ApiPropertyOptional({ example: true, description: 'Estado activo/inactivo del campamento' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
