import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { TransferExecutionService } from "./transfer-execution.service";
import { IntercampRequest } from "../entities/intercamp-request.entity";
import { Person } from "../../users/entities/person.entity";
import { UserAccount } from "../../users/entities/user-account.entity";
import { Inventory } from "../../resources/entities/inventory.entity";
import { InventoryMovement } from "../../resources/entities/inventory-movement.entity";
import { RequestResourceDetail } from "../entities/request-resource-detail.entity";
import { RequestPersonDetail } from "../entities/request-person-detail.entity";
import { AuditLog } from "../../common/entities/audit-log.entity";

const createRepoMock = () => ({ findOne: jest.fn(), save: jest.fn(), create: jest.fn() });

const createQueryRunnerMock = () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  release: jest.fn().mockResolvedValue(undefined),
  manager: {
    create: jest.fn((_entity, value) => value),
    findOne: jest.fn(),
    save: jest.fn(async (_entity, value) => value),
  },
});

describe("TransferExecutionService", () => {
  let service: TransferExecutionService;
  let dataSource: { createQueryRunner: jest.Mock };
  let queryRunner: ReturnType<typeof createQueryRunnerMock>;

  beforeEach(async () => {
    queryRunner = createQueryRunnerMock();
    dataSource = { createQueryRunner: jest.fn(() => queryRunner) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferExecutionService,
        {
          provide: getRepositoryToken(IntercampRequest),
          useValue: createRepoMock(),
        },
        { provide: getRepositoryToken(Person), useValue: createRepoMock() },
        { provide: getRepositoryToken(UserAccount), useValue: createRepoMock() },
        { provide: getRepositoryToken(Inventory), useValue: createRepoMock() },
        {
          provide: getRepositoryToken(InventoryMovement),
          useValue: createRepoMock(),
        },
        {
          provide: getRepositoryToken(RequestResourceDetail),
          useValue: createRepoMock(),
        },
        {
          provide: getRepositoryToken(RequestPersonDetail),
          useValue: createRepoMock(),
        },
        { provide: getRepositoryToken(AuditLog), useValue: createRepoMock() },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(TransferExecutionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should reject execution when the request is not approved", async () => {
    await expect(
      service.executeTransfer({ status: "pending" } as any, 7),
    ).rejects.toThrow(
      new BadRequestException(
        "La solicitud debe estar aprobada por ambos campamentos",
      ),
    );
  });

  it("should execute a full transfer with resources and persons", async () => {
    const request = {
      id: 1,
      status: "approved",
      camp_origin_id: 10,
      camp_destination_id: 20,
      campOrigin: { name: "Camp A" },
      campDestination: { name: "Camp B" },
      resourceDetails: [
        {
          request_id: 1,
          resource_id: 30,
          requested_quantity: 4,
          resource: { name: "Agua" },
        },
      ],
      personDetails: [{ request_id: 1, person_id: 40, transfer_status: "pending" }],
    } as any;

    const originInventory = {
      camp_id: 10,
      resource_id: 30,
      current_quantity: 8,
      minimum_stock_required: 5,
      alert_active: false,
    };
    const person = { id: 40, userAccount: { camp_id: 10 } };

    queryRunner.manager.findOne
      .mockResolvedValueOnce(originInventory)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(person);

    await service.executeTransfer(request, 7);

    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      Inventory,
      expect.objectContaining({
        camp_id: 10,
        resource_id: 30,
        current_quantity: 4,
        alert_active: true,
      }),
    );
    expect(queryRunner.manager.create).toHaveBeenCalledWith(
      Inventory,
      expect.objectContaining({
        camp_id: 20,
        resource_id: 30,
        current_quantity: 4,
        minimum_stock_required: 0,
        alert_active: false,
        last_update: expect.any(Date),
      }),
    );
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      Inventory,
      expect.objectContaining({
        camp_id: 20,
        resource_id: 30,
        current_quantity: 4,
      }),
    );
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      UserAccount,
      expect.objectContaining({ camp_id: 20 }),
    );
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      RequestPersonDetail,
      expect.objectContaining({ transfer_status: "completed" }),
    );
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      IntercampRequest,
      expect.objectContaining({ status: "completed" }),
    );
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      AuditLog,
      expect.objectContaining({
        action: "intercamp_transfer_executed",
        new_value: { resources_transferred: 1, persons_transferred: 1 },
      }),
    );
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  it("should throw when the origin inventory does not exist", async () => {
    const request = {
      id: 1,
      status: "approved",
      camp_origin_id: 10,
      camp_destination_id: 20,
      campOrigin: { name: "Camp A" },
      campDestination: { name: "Camp B" },
      resourceDetails: [
        { request_id: 1, resource_id: 30, requested_quantity: 4, resource: { name: "Agua" } },
      ],
      personDetails: [],
    } as any;

    queryRunner.manager.findOne.mockResolvedValueOnce(null);

    await expect(service.executeTransfer(request, 7)).rejects.toThrow(
      new NotFoundException("Inventario origen no encontrado para recurso 30"),
    );
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it("should throw when the origin inventory is insufficient", async () => {
    const request = {
      id: 1,
      status: "approved",
      camp_origin_id: 10,
      camp_destination_id: 20,
      campOrigin: { name: "Camp A" },
      campDestination: { name: "Camp B" },
      resourceDetails: [
        { request_id: 1, resource_id: 30, requested_quantity: 9, resource: { name: "Agua" } },
      ],
      personDetails: [],
    } as any;

    queryRunner.manager.findOne.mockResolvedValueOnce({
      camp_id: 10,
      resource_id: 30,
      current_quantity: 8,
      minimum_stock_required: 5,
    });

    await expect(service.executeTransfer(request, 7)).rejects.toThrow(
      new BadRequestException("Recurso insuficiente en origen: Agua"),
    );
  });

  it("should throw when a person to transfer does not exist", async () => {
    const request = {
      id: 1,
      status: "approved",
      camp_origin_id: 10,
      camp_destination_id: 20,
      resourceDetails: [],
      personDetails: [{ request_id: 1, person_id: 40, transfer_status: "pending" }],
    } as any;

    queryRunner.manager.findOne.mockResolvedValueOnce(null);

    await expect(service.executeTransfer(request, 7)).rejects.toThrow(
      new NotFoundException("Persona con ID 40 no encontrada"),
    );
  });

  it("should complete a person transfer without updating a user account when absent", async () => {
    const request = {
      id: 1,
      status: "approved",
      camp_origin_id: 10,
      camp_destination_id: 20,
      resourceDetails: [],
      personDetails: [{ request_id: 1, person_id: 40, transfer_status: "pending" }],
    } as any;

    queryRunner.manager.findOne.mockResolvedValueOnce({ id: 40, userAccount: null });

    await service.executeTransfer(request, 7);

    expect(queryRunner.manager.save).not.toHaveBeenCalledWith(
      UserAccount,
      expect.anything(),
    );
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      RequestPersonDetail,
      expect.objectContaining({ transfer_status: "completed" }),
    );
  });


  it("should record zero transferred items when request details are missing", async () => {
    const request = {
      id: 2,
      status: "approved",
      camp_origin_id: 10,
      camp_destination_id: 20,
      resourceDetails: undefined,
      personDetails: undefined,
    } as any;

    await service.executeTransfer(request, 7);

    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      AuditLog,
      expect.objectContaining({
        action: "intercamp_transfer_executed",
        new_value: { resources_transferred: 0, persons_transferred: 0 },
      }),
    );
    expect(queryRunner.manager.save).toHaveBeenCalledWith(
      IntercampRequest,
      expect.objectContaining({ status: "completed" }),
    );
  });
});