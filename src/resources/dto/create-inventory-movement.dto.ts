import { IsInt, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateInventoryMovementDto {
  @IsInt()
  camp_id: number;

  @IsInt()
  resource_id: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  /**
   * 'income' | 'expense' | 'transfer_out' | 'transfer_in' |
   * 'exploration_out' | 'exploration_in' | 'daily_ration' | 'daily_production'
   */
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  description?: string;
}
