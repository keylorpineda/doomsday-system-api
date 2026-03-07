import { IsString, IsEmail, IsInt, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserAccountDto {
  @ApiProperty({ example: 'sconnor' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'sarah.connor@camp.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 4, description: 'Role ID' })
  @IsInt()
  role_id: number;
}
