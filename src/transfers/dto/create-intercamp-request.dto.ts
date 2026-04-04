import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class RequestResourceDetailDto {
  @IsInt()
  resource_id: number;

  @Min(0)
  requested_quantity: number;
}

export class RequestPersonDetailDto {
  @IsInt()
  person_id: number;

  @IsOptional()
  is_leader?: boolean;
}

export class CreateIntercampRequestDto {
  @IsInt()
  camp_origin_id: number;

  @IsInt()
  camp_destination_id: number;

  /** "resources" | "people" | "both" */
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  travel_days?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestResourceDetailDto)
  resource_details?: RequestResourceDetailDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestPersonDetailDto)
  person_details?: RequestPersonDetailDto[];
}
