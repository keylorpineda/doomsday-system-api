import { IsString, IsBoolean, IsOptional, IsInt, Min } from "class-validator";

export class CreateProfessionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  can_explore?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  minimum_active_required?: number;
}
