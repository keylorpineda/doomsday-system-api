import {
  IsString,
  IsOptional,
  IsDecimal,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

export class CreateCampDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  location_description?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_capacity?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsDateString()
  foundation_date?: string;
}
