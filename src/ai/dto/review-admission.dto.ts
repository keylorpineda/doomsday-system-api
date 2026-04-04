import { IsEnum, IsOptional, IsString, IsInt } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

enum AdmissionDecision {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export class ReviewAdmissionDto {
  @ApiProperty({ enum: AdmissionDecision, example: "ACCEPTED" })
  @IsEnum(AdmissionDecision)
  decision: AdmissionDecision;

  @ApiPropertyOptional({ example: "Approved - Camp needs medics" })
  @IsOptional()
  @IsString()
  admin_notes?: string;

  @ApiPropertyOptional({
    example: 5,
    description: "Override suggested profession",
  })
  @IsOptional()
  @IsInt()
  override_profession_id?: number;
}
