import { Test, TestingModule } from "@nestjs/testing";
import { ProductionService } from "./production.service";
import { PersonsService } from "./persons.service";

describe("ProductionService", () => {
  let service: ProductionService;
  let personsService: jest.Mocked<PersonsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        {
          provide: PersonsService,
          useValue: {
            findActiveWorkersByCamp: jest.fn(),
            countPersonsByCamp: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ProductionService);
    personsService = module.get(PersonsService);
  });

  it("should calculate daily production grouping by known profession", async () => {
    personsService.findActiveWorkersByCamp.mockResolvedValueOnce([
      { profession: { id: 1, name: "Recolector" } },
      { profession: { id: 1, name: "Recolector" } },
      { profession: { id: 2, name: "Aguatero" } },
      { profession: { id: 3, name: "Unknown" } },
      {},
    ] as any);

    const result = await service.calculateDailyProduction(4);

    expect(result.totalFood).toBe(20);
    expect(result.totalWater).toBe(15);
    expect(result.byProfession).toEqual([
      {
        professionName: "Recolector",
        workers: 2,
        foodProduction: 20,
        waterProduction: 0,
      },
      {
        professionName: "Aguatero",
        workers: 1,
        foodProduction: 0,
        waterProduction: 15,
      },
    ]);
  });

  it("should calculate daily consumption", async () => {
    personsService.countPersonsByCamp.mockResolvedValueOnce(6);

    await expect(service.calculateDailyConsumption(2)).resolves.toEqual({
      totalFood: 12,
      totalWater: 18,
      totalPersons: 6,
    });
    expect(personsService.countPersonsByCamp).toHaveBeenCalledWith(2, true);
  });

  it("should calculate daily balance", async () => {
    jest.spyOn(service, "calculateDailyProduction").mockResolvedValueOnce({
      totalFood: 16,
      totalWater: 9,
      byProfession: [],
    });
    jest.spyOn(service, "calculateDailyConsumption").mockResolvedValueOnce({
      totalFood: 8,
      totalWater: 12,
      totalPersons: 4,
    });

    await expect(service.calculateDailyBalance(3)).resolves.toEqual({
      production: { food: 16, water: 9 },
      consumption: { food: 8, water: 12 },
      balance: { food: 8, water: -3 },
      persons: 4,
    });
  });
});