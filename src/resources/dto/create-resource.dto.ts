import { IsString, IsOptional } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  name: string;

  /** e.g. 'kg' | 'liters' | 'units' */
  @IsString()
  unit: string;

  /** e.g. 'food' | 'water' | 'hygiene' | 'defense' | 'ammo' */
  @IsString()
  category: string;
}
