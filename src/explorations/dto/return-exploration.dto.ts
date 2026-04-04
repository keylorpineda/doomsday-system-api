import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ExplorationResourceDto } from "./create-exploration.dto";

export class ReturnExplorationDto {
  @IsDateString()
  real_return_date: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExplorationResourceDto)
  found_resources?: ExplorationResourceDto[];
}
