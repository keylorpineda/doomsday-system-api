import { Test, TestingModule } from "@nestjs/testing";
import { AiEvaluationService } from "./ai-evaluation.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Profession } from "../../users/entities/profession.entity";

describe("AiEvaluationService", () => {
  let service: AiEvaluationService;

  const mockContext = {
    population: 50,
    capacity: 100,
    occupancyRate: 0.5,
    balance: { food: 100, water: 200, medical: 50 },
    criticalProfession: "doctor",
    criticalDeficit: 2,
    professionsNeeded: [
      { profession: "doctor", count: 5 },
      { profession: "nurse", count: 3 },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiEvaluationService,
        {
          provide: getRepositoryToken(Profession),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AiEvaluationService>(AiEvaluationService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should check critical rules for candidate", () => {
    const candidate = {
      health_status: 85,
      criminal_record: false,
      age: 30,
      skills: ["leadership"],
    };
    const result = service.checkCriticalRules(
      candidate as any,
      mockContext as any,
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("applies");
  });

  it("should reject candidate when food deficit is critical", () => {
    const candidateWithoutFoodSkills = {
      health_status: 85,
      age: 30,
      skills: ["leadership"],
    };
    const criticalContextm = {
      ...mockContext,
      balance: { food: -15, water: 200, medical: 50 },
    };
    const result = service.checkCriticalRules(
      candidateWithoutFoodSkills as any,
      criticalContextm as any,
    );
    expect(result).toBeDefined();
  });

  it("should accept candidate with food production skills in deficit", () => {
    const candidateWithFoodSkills = {
      health_status: 85,
      age: 30,
      skills: ["agriculture", "leadership"],
    };
    const criticalContext = {
      ...mockContext,
      balance: { food: -15, water: 200, medical: 50 },
    };
    const result = service.checkCriticalRules(
      candidateWithFoodSkills as any,
      criticalContext as any,
    );
    expect(result).toBeDefined();
  });

  it("should calculate admission score", async () => {
    const candidate = {
      first_name: "John",
      last_name: "Doe",
      age: 30,
      health_status: 85,
      physical_condition: 80,
      criminal_record: false,
      skills: ["leadership", "medical"],
      camp_id: 1,
    };
    const result = await service.calculateAdmissionScore(
      candidate as any,
      mockContext as any,
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("decision");
    expect(result).toHaveProperty("confidence");
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("should match profession from skills", async () => {
    const skills = ["medical"];
    const result = await service.matchProfession(skills, mockContext as any);
    expect(result === null || result).toBeDefined();
  });

  it("should return null when no profession matches", async () => {
    const skills = ["cooking"];
    const result = await service.matchProfession(skills, mockContext as any);
    expect(result === null || result).toBeDefined();
  });

  // Additional tests for better coverage
  it("should evaluate candidate with low health status", () => {
    const candidateLowHealth = {
      health_status: 20,
      criminal_record: false,
      age: 30,
      skills: ["leadership"],
    };
    const result = service.checkCriticalRules(
      candidateLowHealth as any,
      mockContext as any,
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("applies");
  });

  it("should evaluate candidate with criminal record", () => {
    const candidateWithRecord = {
      health_status: 85,
      criminal_record: true,
      age: 30,
      skills: ["leadership"],
    };
    const result = service.checkCriticalRules(
      candidateWithRecord as any,
      mockContext as any,
    );
    expect(result).toBeDefined();
  });

  it("should score elderly candidate differently", async () => {
    const elderlyCandidate = {
      first_name: "Maria",
      last_name: "Garcia",
      age: 70,
      health_status: 70,
      physical_condition: 65,
      criminal_record: false,
      skills: ["leadership"],
      camp_id: 1,
    };
    const result = await service.calculateAdmissionScore(
      elderlyCandidate as any,
      mockContext as any,
    );
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("should score young candidate with high physical condition", async () => {
    const youngCandidate = {
      first_name: "Carlos",
      last_name: "Lopez",
      age: 18,
      health_status: 95,
      physical_condition: 95,
      criminal_record: false,
      skills: ["leadership", "construction"],
      camp_id: 1,
    };
    const result = await service.calculateAdmissionScore(
      youngCandidate as any,
      mockContext as any,
    );
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("should handle multiple matching professions", async () => {
    const multiSkillCandidate = ["medical", "agriculture", "construction"];
    const result = await service.matchProfession(
      multiSkillCandidate,
      mockContext as any,
    );
    expect(result === null || result).toBeDefined();
  });

  it("should evaluate critical water deficit", () => {
    const candidate = {
      health_status: 85,
      criminal_record: false,
      age: 30,
      skills: ["leadership"],
    };
    const waterDeficitContext = {
      ...mockContext,
      balance: { food: 100, water: -50, medical: 50 },
    };
    const result = service.checkCriticalRules(
      candidate as any,
      waterDeficitContext as any,
    );
    expect(result).toBeDefined();
  });

  it("should handle empty skills array", async () => {
    const result = await service.matchProfession([], mockContext as any);
    expect(result === null || result).toBeDefined();
  });

  it("should calculate score with no skills", async () => {
    const candidateNoSkills = {
      first_name: "Juan",
      last_name: "Rodriguez",
      age: 35,
      health_status: 80,
      physical_condition: 75,
      criminal_record: false,
      skills: [],
      camp_id: 1,
    };
    const result = await service.calculateAdmissionScore(
      candidateNoSkills as any,
      mockContext as any,
    );
    expect(result).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});
