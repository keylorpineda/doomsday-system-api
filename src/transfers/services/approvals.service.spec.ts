import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ApprovalsService } from "./approvals.service";
import { Approval } from "../entities/approval.entity";
import { IntercampRequest } from "../entities/intercamp-request.entity";
import { UserAccount } from "../../users/entities/user-account.entity";
import { AuditLog } from "../../common/entities/audit-log.entity";

const createRepoMock = () => ({
  findOne: jest.fn(),
  create: jest.fn((value) => value),
  save: jest.fn(async (value) => value),
});

describe("ApprovalsService", () => {
  let service: ApprovalsService;
  let approvalRepo: ReturnType<typeof createRepoMock>;
  let requestRepo: ReturnType<typeof createRepoMock>;
  let userRepo: ReturnType<typeof createRepoMock>;
  let auditRepo: ReturnType<typeof createRepoMock>;

  const baseRequest = {
    id: 50,
    camp_origin_id: 10,
    camp_destination_id: 20,
    status: "pending",
    approvals: [],
  } as any as IntercampRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalsService,
        { provide: getRepositoryToken(Approval), useValue: createRepoMock() },
        {
          provide: getRepositoryToken(IntercampRequest),
          useValue: createRepoMock(),
        },
        { provide: getRepositoryToken(UserAccount), useValue: createRepoMock() },
        { provide: getRepositoryToken(AuditLog), useValue: createRepoMock() },
      ],
    }).compile();

    service = module.get(ApprovalsService);
    approvalRepo = module.get(getRepositoryToken(Approval));
    requestRepo = module.get(getRepositoryToken(IntercampRequest));
    userRepo = module.get(getRepositoryToken(UserAccount));
    auditRepo = module.get(getRepositoryToken(AuditLog));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should throw when the user does not exist", async () => {
    userRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      service.approveOrReject(baseRequest, 99, { status: "approved" } as any),
    ).rejects.toThrow(new NotFoundException("Usuario con ID 99 no encontrado"));
  });

  it("should throw when the user camp is not involved in the request", async () => {
    userRepo.findOne.mockResolvedValueOnce({ id: 2, camp_id: 99, role: {}, camp: {} });

    await expect(
      service.approveOrReject(baseRequest, 2, { status: "approved" } as any),
    ).rejects.toThrow(
      new ForbiddenException(
        "Solo usuarios de los campamentos implicados pueden aprobar/rechazar",
      ),
    );
  });

  it("should throw when the user already approved", async () => {
    userRepo.findOne.mockResolvedValueOnce({ id: 2, camp_id: 10, role: {}, camp: {} });
    const request = {
      ...baseRequest,
      approvals: [{ user_id: 2 }],
    } as any as IntercampRequest;

    await expect(
      service.approveOrReject(request, 2, { status: "approved" } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it("should reject a request and persist audit data", async () => {
    userRepo.findOne.mockResolvedValueOnce({ id: 2, camp_id: 10, role: {}, camp: {} });

    const result = await service.approveOrReject(baseRequest, 2, {
      status: "rejected",
      notes: "faltan insumos",
    } as any);

    expect(approvalRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 2,
        entity_type: "intercamp_request",
        entity_id: 50,
        status: "rejected",
      }),
    );
    expect(requestRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: "rejected" }),
    );
    expect(auditRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "intercamp_request_rejected",
        new_value: { notes: "faltan insumos" },
      }),
    );
    expect(result.bothApproved).toBe(false);
  });

  it("should partially approve when the other camp has not approved yet", async () => {
    userRepo.findOne.mockResolvedValueOnce({ id: 2, camp_id: 10, role: {}, camp: {} });

    const result = await service.approveOrReject(baseRequest, 2, {
      status: "approved",
    } as any);

    expect(requestRepo.save).not.toHaveBeenCalled();
    expect(auditRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "intercamp_request_approved_partial",
        new_value: { waiting_other_camp: true },
      }),
    );
    expect(result.bothApproved).toBe(false);
  });

  it("should mark the request as fully approved when the other camp already approved", async () => {
    userRepo.findOne.mockResolvedValueOnce({ id: 2, camp_id: 10, role: {}, camp: {} });
    const request = {
      ...baseRequest,
      approvals: [
        {
          user_id: 8,
          status: "approved",
          user: { camp_id: 20 },
        },
      ],
    } as any as IntercampRequest;

    const result = await service.approveOrReject(request, 2, {
      status: "approved",
    } as any);

    expect(requestRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved" }),
    );
    expect(auditRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "intercamp_request_approved_dual",
        new_value: { both_camps_approved: true },
      }),
    );
    expect(result.bothApproved).toBe(true);
  });

  it("should mark the request as fully approved when the destination camp approves after origin", async () => {
    userRepo.findOne.mockResolvedValueOnce({ id: 9, camp_id: 20, role: {}, camp: {} });
    const request = {
      ...baseRequest,
      approvals: [
        {
          user_id: 3,
          status: "approved",
          user: { camp_id: 10 },
        },
      ],
    } as any as IntercampRequest;

    const result = await service.approveOrReject(request, 9, {
      status: "approved",
    } as any);

    expect(requestRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved" }),
    );
    expect(result.bothApproved).toBe(true);
  });
});