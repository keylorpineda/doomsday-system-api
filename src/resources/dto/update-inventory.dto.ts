import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimum_stock_required?: number;

  @IsOptional()
  @IsNumber()
  current_quantity?: number;
}
