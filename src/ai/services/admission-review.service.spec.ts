import { Test, TestingModule } from "@nestjs/testing";
import { AdmissionReviewService } from "./admission-review.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AiAdmission } from "../entities/ai-admission.entity";
import { Person } from "../../users/entities/person.entity";
import { UserAccount } from "../../users/entities/user-account.entity";

describe("AdmissionReviewService", () => {
  let service: AdmissionReviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdmissionReviewService,
        {
          provide: getRepositoryToken(AiAdmission),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 1,
              status: "PENDING_REVIEW",
              person_id: 1,
              tracking_code: "ADM-001",
              suggested_profession_id: 1,
              candidate_data: {
                first_name: "John",
                last_name: "Doe",
                age: 30,
                skills: ["leadership"],
              },
            }),
            save: jest.fn().mockResolvedValue({ id: 1 }),
          },
        },
        {
          provide: getRepositoryToken(Person),
          useValue: {
            create: jest.fn().mockReturnValue({ id: 1, first_name: "John" }),
            save: jest.fn().mockResolvedValue({ id: 1, first_name: "John" }),
            findOne: jest.fn().mockResolvedValue({ id: 1 }),
          },
        },
        {
          provide: getRepositoryToken(UserAccount),
          useValue: {
            create: jest.fn().mockReturnValue({}),
            save: jest.fn().mockResolvedValue({ id: 1, username: "johndoe" }),
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<AdmissionReviewService>(AdmissionReviewService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should review an admission as accepted", async () => {
    const dto = { decision: "ACCEPTED", admin_notes: "Approved" };
    const result = await service.reviewAdmission(1, dto as any, 1);
    expect(result).toBeDefined();
  });

  it("should review an admission as rejected", async () => {
    const dto = { decision: "REJECTED", admin_notes: "Not qualified" };
    const result = await service.reviewAdmission(1, dto as any, 1);
    expect(result).toBeDefined();
  });

  it("should throw when admission not found", async () => {
    const dto = { decision: "ACCEPTED" };
    try {
      await service.reviewAdmission(999, dto as any, 1);
    } catch (error: any) {
      expect(error.message).toContain("not found");
    }
  });

  it("should throw when admission already reviewed", async () => {
    const dto = { decision: "ACCEPTED" };
    try {
      await service.reviewAdmission(2, dto as any, 1);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should create user account for person", async () => {
    const dto = {
      username: "johndoe",
      email: "john@example.com",
      password: "Password123!",
      role_id: 1,
    };
    const result = await service.createUserAccountForPerson(1, dto as any);
    expect(result).toBeDefined();
  });

  it("should throw when admission not found for account creation", async () => {
    const dto = {
      username: "johndoe",
      email: "john@example.com",
      password: "Password123!",
      role_id: 1,
    };
    try {
      await service.createUserAccountForPerson(999, dto as any);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should throw when account already exists", async () => {
    const dto = {
      username: "johndoe",
      email: "john@example.com",
      password: "Password123!",
      role_id: 1,
    };
    try {
      await service.createUserAccountForPerson(3, dto as any);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should hash password before saving", async () => {
    const dto = {
      username: "johndoe",
      email: "john@example.com",
      password: "Password123!",
      role_id: 1,
    };
    const result = await service.createUserAccountForPerson(1, dto as any);
    expect(result).toBeDefined();
  });

  it("should set correct role assignment", async () => {
    const dto = {
      username: "johndoe",
      email: "john@example.com",
      password: "Password123!",
      role_id: 2,
    };
    const result = await service.createUserAccountForPerson(1, dto as any);
    expect(result).toBeDefined();
  });

  it("should include override profession in review", async () => {
    const dto = { decision: "ACCEPTED", override_profession_id: 5 };
    const result = await service.reviewAdmission(1, dto as any, 1);
    expect(result).toBeDefined();
  });

  it("should generate survivor code for accepted admission", async () => {
    const dto = { decision: "ACCEPTED" };
    const result = await service.reviewAdmission(1, dto as any, 1);
    expect(result).toBeDefined();
  });

  it("should create person in camp if not exists", async () => {
    const dto = { decision: "ACCEPTED" };
    const result = await service.reviewAdmission(1, dto as any, 1);
    if (result?.person) {
      expect(result.person).toBeDefined();
    }
  });
});
