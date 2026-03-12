import {
  IsString,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  IsEmail,
  Min,
  Max,
  @ApiPropertyOptional({
    example: 'Era médico en el hospital central antes del colapso. Perdió a su familia en el primer mes.',
    description: 'Historia personal del candidato para análisis NLP (Caja de Cristal)',
  })
  @IsOptional()
  @IsString()
  personal_history?: string;
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class SubmitAdmissionDto {
  @ApiProperty({ example: 'Sarah' })
  @IsString()
  @MinLength(2)
  first_name: string;

  @ApiProperty({ example: 'Connor' })
  @IsString()
  @MinLength(2)
  last_name: string;

  @ApiProperty({ example: 35 })
  @IsInt()
  @Min(16)
  @Max(80)
  age: number;

  @ApiProperty({ enum: Gender, example: 'female' })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 95, description: 'Health status 0-100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  health_status: number;

  @ApiProperty({ example: 90, description: 'Physical condition 0-100' })
  @IsNumber()
  @Min(0)
  @Max(100)
  physical_condition: number;

  @ApiPropertyOptional({ example: ['diabetes', 'asthma'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medical_conditions?: string[];

  @ApiProperty({ example: ['medicine', 'leadership', 'first_aid'] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiPropertyOptional({ example: 'Doctor' })
  @IsOptional()
  @IsString()
  previous_profession?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  years_experience?: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  criminal_record: boolean;

  @ApiPropertyOptional({ example: 85, description: 'Psychological evaluation 0-100' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  psychological_evaluation?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  camp_id: number;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/photo.jpg' })
  @IsOptional()
  @IsString()
  photo_url?: string;

  @ApiPropertyOptional({ example: 'https://cloudinary.com/id.jpg' })
  @IsOptional()
  @IsString()
  id_card_url?: string;

  @ApiPropertyOptional({ example: 'contact@example.com' })
  @IsOptional()
  @IsEmail()
  contact_email?: string;
}
