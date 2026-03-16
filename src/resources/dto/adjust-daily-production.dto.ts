import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class AdjustDailyProductionDto {
  @IsOptional()
  @IsInt()
  camp_id?: number;

  @IsInt()
  resource_id: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  description?: string;
}
