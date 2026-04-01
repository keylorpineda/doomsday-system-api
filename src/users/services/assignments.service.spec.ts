import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { AssignmentsService } from "./assignments.service";
import { TemporaryAssignment } from "../entities/temporary-assignment.entity";
import { Person } from "../entities/person.entity";
import { ProfessionsService } from "./professions.service";
import { TEMPORARY_ASSIGNMENT_CONFIG } from "../constants/professions.constants";

describe("AssignmentsService", () => {
  let service: AssignmentsService;
  let tempAssignmentRepo: jest.Mocked<Repository<TemporaryAssignment>>;
  let personRepo: jest.Mocked<Repository<Person>>;
  let professionsService: jest.Mocked<ProfessionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        {
          provide: getRepositoryToken(TemporaryAssignment),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Person),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ProfessionsService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AssignmentsService);
    tempAssignmentRepo = module.get(getRepositoryToken(TemporaryAssignment));
    personRepo = module.get(getRepositoryToken(Person));
    professionsService = module.get(ProfessionsService);
  });

  it("should create a temporary assignment with defaults", async () => {
    const person = {
      id: 1,
      profession_id: 10,
      can_work: true,
      userAccount: { id: 7 },
    } as any;
    const assignment = { id: 4 } as TemporaryAssignment;
    personRepo.findOne.mockResolvedValueOnce(person);
    professionsService.findById.mockResolvedValueOnce({ id: 11 } as any);
    tempAssignmentRepo.findOne.mockResolvedValueOnce(null);
    tempAssignmentRepo.create.mockReturnValueOnce(assignment);
    tempAssignmentRepo.save.mockResolvedValueOnce(assignment);

    await expect(
      service.create({ person_id: 1, profession_temporary_id: 11 } as any, 99),
    ).resolves.toBe(assignment);
    expect(tempAssignmentRepo.findOne).toHaveBeenCalledWith({
      where: {
        user_account_id: 7,
        end_date: IsNull(),
      },
    });
    expect(tempAssignmentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_account_id: 7,
        profession_origin_id: 10,
        profession_temporary_id: 11,
        start_date: expect.any(Date),
        end_date: expect.any(Date),
        reason: "Assigned due to profession shortage",
        user_approve_id: 99,
      }),
    );
  });

  it("should create a temporary assignment with explicit dates and reason", async () => {
    const person = {
      id: 1,
      profession_id: 10,
      can_work: true,
      userAccount: { id: 7 },
    } as any;
    const assignment = { id: 4 } as TemporaryAssignment;
    personRepo.findOne.mockResolvedValueOnce(person);
    professionsService.findById.mockResolvedValueOnce({ id: 12 } as any);
    tempAssignmentRepo.findOne.mockResolvedValueOnce(null);
    tempAssignmentRepo.create.mockReturnValueOnce(assignment);
    tempAssignmentRepo.save.mockResolvedValueOnce(assignment);

    await service.create(
      {
        person_id: 1,
        profession_temporary_id: 12,
        duration_days: 3,
        reason: "Urgencia",
        start_date: "2026-03-01T00:00:00.000Z",
      } as any,
      100,
    );

    expect(tempAssignmentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: "Urgencia",
        user_approve_id: 100,
      }),
    );
  });

  it("should reject creating assignment when person does not exist", async () => {
    personRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      service.create({ person_id: 50, profession_temporary_id: 2 } as any, 1),
    ).rejects.toThrow(new NotFoundException("Person with ID 50 not found"));
  });

  it("should reject creating assignment when person has no profession", async () => {
    personRepo.findOne.mockResolvedValueOnce({ profession_id: null } as any);

    await expect(
      service.create({ person_id: 1, profession_temporary_id: 2 } as any, 1),
    ).rejects.toThrow(
      new BadRequestException(
        "Person must have a profession to be temporarily assigned",
      ),
    );
  });

  it("should reject creating assignment when person cannot work", async () => {
    personRepo.findOne.mockResolvedValueOnce({
      profession_id: 1,
      can_work: false,
      status: "sick",
    } as any);

    await expect(
      service.create({ person_id: 1, profession_temporary_id: 2 } as any, 1),
    ).rejects.toThrow(new BadRequestException("Person cannot work (status: sick)"));
  });

  it("should reject creating assignment for current profession", async () => {
    personRepo.findOne.mockResolvedValueOnce({
      profession_id: 2,
      can_work: true,
      userAccount: { id: 1 },
    } as any);
    professionsService.findById.mockResolvedValueOnce({ id: 2 } as any);

    await expect(
      service.create({ person_id: 1, profession_temporary_id: 2 } as any, 1),
    ).rejects.toThrow(
      new BadRequestException("Cannot assign person to their current profession"),
    );
  });

  it("should reject creating assignment when one is already active", async () => {
    personRepo.findOne.mockResolvedValueOnce({
      profession_id: 2,
      can_work: true,
      userAccount: { id: 1 },
    } as any);
    professionsService.findById.mockResolvedValueOnce({ id: 3 } as any);
    tempAssignmentRepo.findOne.mockResolvedValueOnce({ id: 99 } as any);

    await expect(
      service.create({ person_id: 1, profession_temporary_id: 3 } as any, 1),
    ).rejects.toThrow(
      new ConflictException("Person already has an active temporary assignment"),
    );
  });

  it("should find active assignments and optionally filter by camp", async () => {
    const qbWithCamp: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValueOnce([{ id: 1 }]),
    };
    const qbWithoutCamp: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValueOnce([]),
    };
    tempAssignmentRepo.createQueryBuilder
      .mockReturnValueOnce(qbWithCamp)
      .mockReturnValueOnce(qbWithoutCamp);

    await expect(service.findActive(8)).resolves.toEqual([{ id: 1 }]);
    await expect(service.findActive()).resolves.toEqual([]);
    expect(qbWithCamp.andWhere).toHaveBeenCalledWith(
      "userAccount.camp_id = :campId",
      { campId: 8 },
    );
    expect(qbWithoutCamp.andWhere).not.toHaveBeenCalledWith(
      "userAccount.camp_id = :campId",
      { campId: 8 },
    );
  });

  it("should end an assignment", async () => {
    const assignment = { id: 4, end_date: null } as any;
    tempAssignmentRepo.findOne.mockResolvedValueOnce(assignment);
    tempAssignmentRepo.save.mockImplementation(async (value) => value as any);

    const result = await service.end(4);

    expect(result.end_date).toBeInstanceOf(Date);
  });

  it("should reject ending a missing assignment", async () => {
    tempAssignmentRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.end(404)).rejects.toThrow(
      new NotFoundException("Temporary assignment with ID 404 not found"),
    );
  });

  it("should use the configured default duration when none is provided", () => {
    expect(TEMPORARY_ASSIGNMENT_CONFIG.DEFAULT_DURATION_DAYS).toBe(7);
  });
});