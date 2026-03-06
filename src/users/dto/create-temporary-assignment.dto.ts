import { IsInt, IsString, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateTemporaryAssignmentDto {
  @IsInt()
  person_id: number; // ID de la persona a asignar temporalmente

  @IsInt()
  profession_temporary_id: number; // ID de la profesión a la que se asigna

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  duration_days?: number; // Duración en días (default: 7)

  @IsOptional()
  @IsString()
  reason?: string; // Motivo de la asignación

  @IsOptional()
  @IsDateString()
  start_date?: string; // Fecha de inicio (default: ahora)
}
