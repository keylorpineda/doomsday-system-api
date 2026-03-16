import { IsString, IsOptional } from "class-validator";

export class CreateResourceDto {
  @IsString()
  name: string;

  @IsString()
  unit: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;
}
