import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProfessionsService } from "./professions.service";
import { Profession } from "../entities/profession.entity";
import { PersonsService } from "./persons.service";

describe("ProfessionsService", () => {
  let service: ProfessionsService;
  let professionRepo: jest.Mocked<Repository<Profession>>;
  let personsService: jest.Mocked<PersonsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionsService,
        {
          provide: getRepositoryToken(Profession),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PersonsService,
          useValue: {
            countActiveWorkers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ProfessionsService);
    professionRepo = module.get(getRepositoryToken(Profession));
    personsService = module.get(PersonsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should find all professions with persons relation", async () => {
    professionRepo.find.mockResolvedValueOnce([{ id: 1 }] as any);

    await expect(service.findAll()).resolves.toEqual([{ id: 1 }]);
    expect(professionRepo.find).toHaveBeenCalledWith({
      relations: ["persons"],
    });
  });

  it("should find a profession by id", async () => {
    const profession = { id: 1 } as Profession;
    professionRepo.findOne.mockResolvedValueOnce(profession);

    await expect(service.findById(1)).resolves.toBe(profession);
  });

  it("should throw when profession is missing", async () => {
    professionRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.findById(44)).rejects.toThrow(
      new NotFoundException("Profession with ID 44 not found"),
    );
  });

  it("should create a profession", async () => {
    const dto = { name: "Ingeniero" };
    const profession = { id: 2, ...dto } as Profession;
    professionRepo.create.mockReturnValueOnce(profession);
    professionRepo.save.mockResolvedValueOnce(profession);

    await expect(service.create(dto as any)).resolves.toBe(profession);
    expect(professionRepo.create).toHaveBeenCalledWith(dto);
  });

  it("should check minimum workers and warn when below minimum", async () => {
    const warnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    jest.spyOn(service, "findById").mockResolvedValueOnce({
      id: 4,
      name: "Guardia",
      minimum_active_required: 3,
    } as Profession);
    personsService.countActiveWorkers.mockResolvedValueOnce(1);

    const result = await service.checkMinimumWorkers(4, 2);

    expect(result).toEqual({
      needsWorkers: true,
      currentWorkers: 1,
      minimumRequired: 3,
    });
    expect(personsService.countActiveWorkers).toHaveBeenCalledWith(4, 2);
    expect(warnSpy).toHaveBeenCalled();
  });

  it("should check minimum workers without warning when minimum is met", async () => {
    const warnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);
    jest.spyOn(service, "findById").mockResolvedValueOnce({
      id: 4,
      name: "Guardia",
      minimum_active_required: 2,
    } as Profession);
    personsService.countActiveWorkers.mockResolvedValueOnce(2);

    const result = await service.checkMinimumWorkers(4);

    expect(result.needsWorkers).toBe(false);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("should return professions needing workers", async () => {
    jest
      .spyOn(service, "findAll")
      .mockResolvedValueOnce([
        { id: 1, minimum_active_required: 2 } as Profession,
        { id: 2, minimum_active_required: 1 } as Profession,
      ]);
    personsService.countActiveWorkers
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);

    const result = await service.getProfessionsNeedingWorkers();

    expect(result).toEqual([
      {
        profession: { id: 1, minimum_active_required: 2 },
        currentWorkers: 1,
        minimumRequired: 2,
        deficit: 1,
      },
    ]);
  });

  it("should return professions with excess workers", async () => {
    jest
      .spyOn(service, "findAll")
      .mockResolvedValueOnce([
        { id: 1, minimum_active_required: 2 } as Profession,
        { id: 2, minimum_active_required: 3 } as Profession,
      ]);
    personsService.countActiveWorkers
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(3);

    const result = await service.getProfessionsWithExcess();

    expect(result).toEqual([
      {
        profession: { id: 1, minimum_active_required: 2 },
        currentWorkers: 4,
        minimumRequired: 2,
        excess: 2,
      },
    ]);
  });
});
