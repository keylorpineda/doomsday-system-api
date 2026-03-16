import { IsString, IsOptional, IsEnum } from "class-validator";
import { PersonStatus } from "../constants/professions.constants";

export class UpdatePersonStatusDto {
  @IsEnum(PersonStatus, {
    message: `Status must be one of: ${Object.values(PersonStatus).join(", ")}`,
  })
  status: PersonStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
