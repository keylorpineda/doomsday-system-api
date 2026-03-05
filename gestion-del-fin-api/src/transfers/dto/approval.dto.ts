import { IsString, IsOptional } from 'class-validator';

export class ApprovalDto {
  /** 'approved' | 'rejected' */
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
