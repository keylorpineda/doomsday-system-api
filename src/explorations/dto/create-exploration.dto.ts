import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExplorationPersonDto {
  @IsInt()
  person_id: number;

  @IsOptional()
  @IsBoolean()
  is_leader?: boolean;
}

export class ExplorationResourceDto {
  @IsInt()
  resource_id: number;

  @IsString()
  flow: string;

  @IsInt()
  @Min(0)
  quantity: number;
}

export class CreateExplorationDto {
  @IsInt()
  camp_id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  destination_description?: string;

  @IsDateString()
  departure_date: string;

  @IsInt()
  @Min(1)
  estimated_days: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  grace_days?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExplorationPersonDto)
  persons: ExplorationPersonDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExplorationResourceDto)
  resources?: ExplorationResourceDto[];
}
