import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  IsNumber,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampDto {
  @ApiProperty({ example: 'Campamento Norte', description: 'Nombre del campamento' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Zona boscosa al norte del río' })
  @IsOptional()
  @IsString()
  location_description?: string;

  @ApiPropertyOptional({ example: 9.9281, description: 'Latitud GPS (-90 a 90)' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: -84.0907, description: 'Longitud GPS (-180 a 180)' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ example: 150, description: 'Capacidad máxima de personas' })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_capacity?: number;

  @ApiPropertyOptional({ example: '2025-01-01', description: 'Fecha de fundación (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  foundation_date?: string;
}
