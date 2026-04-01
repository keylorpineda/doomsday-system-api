import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  CreateIntercampRequestDto,
  RequestPersonDetailDto,
  RequestResourceDetailDto,
} from "./dto/create-intercamp-request.dto";
import { ApprovalDto } from "./dto/approval.dto";

describe("Transfers DTOs", () => {
  it("should validate a complete create request dto", async () => {
    const dto = plainToInstance(CreateIntercampRequestDto, {
      camp_origin_id: 1,
      camp_destination_id: 2,
      type: "both",
      notes: "Mover apoyo",
      resource_details: [{ resource_id: 10, requested_quantity: 4 }],
      person_details: [{ person_id: 11, is_leader: true }],
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.resource_details?.[0]).toBeInstanceOf(RequestResourceDetailDto);
    expect(dto.person_details?.[0]).toBeInstanceOf(RequestPersonDetailDto);
  });

  it("should reject invalid create request dto values", async () => {
    const dto = plainToInstance(CreateIntercampRequestDto, {
      camp_origin_id: "x",
      camp_destination_id: "y",
      type: 1,
      resource_details: [{ resource_id: "bad", requested_quantity: -1 }],
      person_details: [{ person_id: "bad" }],
    });

    const errors = await validate(dto);
    const errorProps = errors.map((error) => error.property);

    expect(errorProps).toEqual(
      expect.arrayContaining([
        "camp_origin_id",
        "camp_destination_id",
        "type",
        "resource_details",
        "person_details",
      ]),
    );
  });

  it("should validate approval dto with optional notes", async () => {
    const dto = plainToInstance(ApprovalDto, {
      status: "approved",
      notes: "todo bien",
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it("should reject approval dto with invalid status type", async () => {
    const dto = plainToInstance(ApprovalDto, { status: 123 });
    const errors = await validate(dto);

    expect(errors[0]?.property).toBe("status");
  });
});
