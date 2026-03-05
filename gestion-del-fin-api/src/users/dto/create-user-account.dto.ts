import { IsString, IsInt, IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateUserAccountDto {
  @IsInt()
  camp_id: number;

  @IsInt()
  person_id: number;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsInt()
  role_id?: number;
}
