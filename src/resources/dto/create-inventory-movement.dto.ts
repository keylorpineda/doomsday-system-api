import { IsInt, IsNumber, IsString, IsOptional, Min } from "class-validator";

export class CreateInventoryMovementDto {
  @IsInt()
  camp_id: number;

  @IsInt()
  resource_id: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  description?: string;
}
