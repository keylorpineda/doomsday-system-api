import { IsInt } from 'class-validator';

export class ApproveTemporaryAssignmentDto {
  @IsInt()
  assignment_id: number;
}
