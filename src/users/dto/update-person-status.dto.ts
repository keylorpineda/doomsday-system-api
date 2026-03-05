import { IsString, IsOptional } from 'class-validator';

export class UpdatePersonStatusDto {
  /**
   * New status: 'active' | 'sick' | 'injured' | 'exploring' | 'transferred'
   */
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
