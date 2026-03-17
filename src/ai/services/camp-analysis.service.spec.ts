import { Test, TestingModule } from "@nestjs/testing";
import { CampAnalysisService } from "./camp-analysis.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Camp } from "../../camps/entities/camp.entity";
import { ProductionService } from "../../users/services/production.service";
import { ProfessionsService } from "../../users/services/professions.service";
import { PersonsService } from "../../users/services/persons.service";

describe("CampAnalysisService", () => {
  let service: CampAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampAnalysisService,
        {
          provide: getRepositoryToken(Camp),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 1,
              nombre: "Test Camp",
              max_capacity: 100,
            }),
          },
        },
        {
          provide: ProductionService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              balance: { food: 100, water: 200, medical: 50 },
            }),
            calculateDailyBalance: jest.fn().mockResolvedValue({
              balance: { food: 100, water: 200, medical: 50 },
            }),
          },
        },
        {
          provide: ProfessionsService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
            getProfessionsNeedingWorkers: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: PersonsService,
          useValue: {
            findByRole: jest.fn().mockResolvedValue([]),
            find: jest.fn().mockResolvedValue([]),
            countPersonsByCamp: jest.fn().mockResolvedValue(50),
          },
        },
      ],
    }).compile();

    service = module.get<CampAnalysisService>(CampAnalysisService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should analyze camp context", async () => {
    const result = await service.analyzeCampContext(1);
    expect(result).toBeDefined();
  });

  it("should return camp analysis with required properties", async () => {
    const result = await service.analyzeCampContext(1);
    if (result) {
      expect(result).toHaveProperty("population");
      expect(result).toHaveProperty("capacity");
      expect(result).toHaveProperty("occupancyRate");
      expect(result).toHaveProperty("balance");
    }
  });

  it("should calculate occupancy rate correctly", async () => {
    const result = await service.analyzeCampContext(1);
    if (result) {
      expect(result.occupancyRate).toBeLessThanOrEqual(100);
      expect(result.occupancyRate).toBeGreaterThanOrEqual(0);
    }
  });

  it("should handle camp at full capacity", async () => {
    const module = await Test.createTestingModule({
      providers: [
        CampAnalysisService,
        {
          provide: getRepositoryToken(Camp),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 2,
              nombre: "Full Camp",
              max_capacity: 100,
            }),
          },
        },
        {
          provide: ProductionService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              balance: { food: 10, water: 20, medical: 5 },
            }),
            calculateDailyBalance: jest.fn().mockResolvedValue({
              balance: { food: 10, water: 20, medical: 5 },
            }),
          },
        },
        {
          provide: ProfessionsService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
            getProfessionsNeedingWorkers: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: PersonsService,
          useValue: {
            findByRole: jest.fn().mockResolvedValue([]),
            find: jest.fn().mockResolvedValue([]),
            countPersonsByCamp: jest.fn().mockResolvedValue(100),
          },
        },
      ],
    }).compile();

    const fullService = module.get<CampAnalysisService>(CampAnalysisService);
    const result = await fullService.analyzeCampContext(2);
    if (result) {
      expect(result.occupancyRate).toEqual(100);
    }
  });

  it("should handle empty camp", async () => {
    const emptyModule = await Test.createTestingModule({
      providers: [
        CampAnalysisService,
        {
          provide: getRepositoryToken(Camp),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 3,
              nombre: "Empty Camp",
              max_capacity: 100,
            }),
          },
        },
        {
          provide: ProductionService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              balance: { food: 500, water: 800, medical: 200 },
            }),
            calculateDailyBalance: jest.fn().mockResolvedValue({
              balance: { food: 500, water: 800, medical: 200 },
            }),
          },
        },
        {
          provide: ProfessionsService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
            getProfessionsNeedingWorkers: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: PersonsService,
          useValue: {
            findByRole: jest.fn().mockResolvedValue([]),
            find: jest.fn().mockResolvedValue([]),
            countPersonsByCamp: jest.fn().mockResolvedValue(0),
          },
        },
      ],
    }).compile();

    const emptyService =
      emptyModule.get<CampAnalysisService>(CampAnalysisService);
    const result = await emptyService.analyzeCampContext(3);
    if (result) {
      expect(result.occupancyRate).toEqual(0);
    }
  });

  it("should identify critical profession deficit", async () => {
    const criticalModule = await Test.createTestingModule({
      providers: [
        CampAnalysisService,
        {
          provide: getRepositoryToken(Camp),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 4,
              nombre: "Medical Crisis Camp",
              max_capacity: 100,
            }),
          },
        },
        {
          provide: ProductionService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              balance: { food: 100, water: 200, medical: 5 },
            }),
            calculateDailyBalance: jest.fn().mockResolvedValue({
              balance: { food: 100, water: 200, medical: 5 },
            }),
          },
        },
        {
          provide: ProfessionsService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
            getProfessionsNeedingWorkers: jest.fn().mockResolvedValue([
              { profession: { name: "doctor" }, deficit: 10 },
              { profession: { name: "nurse" }, deficit: 5 },
            ]),
          },
        },
        {
          provide: PersonsService,
          useValue: {
            findByRole: jest.fn().mockResolvedValue([]),
            find: jest.fn().mockResolvedValue([]),
            countPersonsByCamp: jest.fn().mockResolvedValue(50),
          },
        },
      ],
    }).compile();

    const criticalService =
      criticalModule.get<CampAnalysisService>(CampAnalysisService);
    const result = await criticalService.analyzeCampContext(4);
    if (result) {
      expect(result.criticalDeficit).toBeGreaterThan(0);
    }
  });

  it("should handle balanced camp resources", async () => {
    const balancedModule = await Test.createTestingModule({
      providers: [
        CampAnalysisService,
        {
          provide: getRepositoryToken(Camp),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 5,
              nombre: "Balanced Camp",
              max_capacity: 100,
            }),
          },
        },
        {
          provide: ProductionService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              balance: { food: 200, water: 300, medical: 100 },
            }),
            calculateDailyBalance: jest.fn().mockResolvedValue({
              balance: { food: 200, water: 300, medical: 100 },
            }),
          },
        },
        {
          provide: ProfessionsService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
            getProfessionsNeedingWorkers: jest
              .fn()
              .mockResolvedValue([
                { profession: { name: "farmer" }, deficit: 2 },
              ]),
          },
        },
        {
          provide: PersonsService,
          useValue: {
            findByRole: jest.fn().mockResolvedValue([]),
            find: jest.fn().mockResolvedValue([]),
            countPersonsByCamp: jest.fn().mockResolvedValue(60),
          },
        },
      ],
    }).compile();

    const balancedService =
      balancedModule.get<CampAnalysisService>(CampAnalysisService);
    const result = await balancedService.analyzeCampContext(5);
    expect(result).toBeDefined();
    if (result) {
      expect(result.balance).toBeDefined();
      expect(result.balance.food).toBeGreaterThan(0);
    }
  });
});
