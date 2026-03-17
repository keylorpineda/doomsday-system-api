import { Test, TestingModule } from "@nestjs/testing";
import { AiService } from "./ai.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AiAdmission } from "./entities/ai-admission.entity";
import { Camp } from "../camps/entities/camp.entity";
import { CampAnalysisService } from "./services/camp-analysis.service";
import { AiEvaluationService } from "./services/ai-evaluation.service";
import { AdmissionReviewService } from "./services/admission-review.service";
import { PythonAiService } from "./services/python-ai.service";

describe("AiService", () => {
  let service: AiService;

  const mockSubmitDto = {
    first_name: "John",
    last_name: "Doe",
    age: 30,
    camp_id: 1,
    health_status: 85,
    physical_condition: 80,
    criminal_record: false,
    skills: ["leadership"],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: getRepositoryToken(AiAdmission),
          useValue: {
            create: jest
              .fn()
              .mockReturnValue({ id: 1, tracking_code: "ADM-001" }),
            save: jest.fn().mockResolvedValue({ id: 1 }),
            findOne: jest.fn().mockResolvedValue({
              id: 1,
              tracking_code: "ADM-001",
              candidate_data: { first_name: "John", last_name: "Doe" },
              camp: { id: 1, nombre: "Test Camp" },
              status: "PENDING_REVIEW",
            }),
            find: jest.fn().mockResolvedValue([{ id: 1 }]),
            findAndCount: jest.fn().mockResolvedValue([[{ id: 1 }], 1]),
            count: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: getRepositoryToken(Camp),
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue({ id: 1, nombre: "Test Camp" }),
          },
        },
        {
          provide: CampAnalysisService,
          useValue: {
            analyzeCampContext: jest
              .fn()
              .mockResolvedValue({ occupancyRate: 0.5 }),
          },
        },
        {
          provide: AiEvaluationService,
          useValue: {
            checkCriticalRules: jest.fn().mockReturnValue({ applies: false }),
            calculateAdmissionScore: jest.fn().mockResolvedValue({
              score: 85,
              decision: "ACCEPTED",
              confidence: "HIGH",
              factors: [],
            }),
            matchProfession: jest
              .fn()
              .mockResolvedValue({ id: 1, nombre: "Doctor" }),
            generateJustification: jest
              .fn()
              .mockReturnValue("Good fit based on skills"),
          },
        },
        {
          provide: AdmissionReviewService,
          useValue: {
            reviewAdmission: jest
              .fn()
              .mockResolvedValue({ admission: { id: 1 } }),
            createUserAccountForPerson: jest
              .fn()
              .mockResolvedValue({ id: 1, username: "johndoe" }),
          },
        },
        { provide: PythonAiService, useValue: { analyzeAdmission: jest.fn() } },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should submit an admission", async () => {
    const result = await service.submitAdmission(mockSubmitDto as any);
    expect(result).toBeDefined();
  });

  it("should track an admission", async () => {
    const result = await service.trackAdmission("ADM-001");
    expect(result).toBeDefined();
  });

  it("should get pending admissions", async () => {
    const result = await service.getPendingAdmissions();
    expect(result).toBeDefined();
  });

  it("should get admission detail", async () => {
    const result = await service.getAdmissionDetail(1);
    expect(result).toBeDefined();
  });

  it("should review an admission", async () => {
    const result = await service.reviewAdmission(
      1,
      { decision: "ACCEPTED" } as any,
      1,
    );
    expect(result).toBeDefined();
  });

  it("should create user account", async () => {
    const result = await service.createUserAccountForPerson(1, {} as any);
    expect(result).toBeDefined();
  });
});
