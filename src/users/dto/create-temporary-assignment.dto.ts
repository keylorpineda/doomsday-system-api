import { IsInt, IsString, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateTemporaryAssignmentDto {
  @IsInt()
  person_id: number;

  @IsInt()
  profession_temporary_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  duration_days?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;
}
