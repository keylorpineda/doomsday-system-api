import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import {
  CampPopulationSummaryView,
  InventoryStatusView,
  InventoryAlertView,
  TransferCampSummaryView,
  ExplorationSummaryView,
} from "../database/views";

describe("DashboardService", () => {
  let service: DashboardService;
  let campPopulationView: { findOne: jest.Mock };
  let inventoryStatusView: { find: jest.Mock };
  let inventoryAlertView: { find: jest.Mock };
  let transferSummaryView: { findOne: jest.Mock };
  let explorationSummaryView: { count: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(CampPopulationSummaryView),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(InventoryStatusView),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(InventoryAlertView),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(TransferCampSummaryView),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(ExplorationSummaryView),
          useValue: { count: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    campPopulationView = module.get(getRepositoryToken(CampPopulationSummaryView));
    inventoryStatusView = module.get(getRepositoryToken(InventoryStatusView));
    inventoryAlertView = module.get(getRepositoryToken(InventoryAlertView));
    transferSummaryView = module.get(getRepositoryToken(TransferCampSummaryView));
    explorationSummaryView = module.get(getRepositoryToken(ExplorationSummaryView));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should build dashboard metrics with numeric conversions", async () => {
    campPopulationView.findOne.mockResolvedValue({
      camp_id: 3,
      total_people: "15",
      active_workers: "10",
      unavailable_people: "5",
      max_capacity: 20,
      occupancy_rate: "75.5",
    });
    explorationSummaryView.count.mockResolvedValue(2);
    inventoryStatusView.find.mockResolvedValue([
      { resource_id: 1, current_quantity: "8" },
      { resource_id: 2, current_quantity: 4 },
    ]);
    inventoryAlertView.find.mockResolvedValue([
      {
        resource_id: "2",
        resource_name: "Agua",
        current_quantity: "4",
        minimum_stock_required: "6",
      },
    ]);
    transferSummaryView.findOne.mockResolvedValue({
      pending: "3",
      approved: "1",
      completed: "7",
    });

    const result = await service.getMetricsByCamp(3, "admin");

    expect(campPopulationView.findOne).toHaveBeenCalledWith({
      where: { camp_id: 3 },
    });
    expect(explorationSummaryView.count).toHaveBeenCalledWith({
      where: {
        camp_id: 3,
        status: "in_progress",
      },
    });
    expect(inventoryStatusView.find).toHaveBeenCalledWith({
      where: { camp_id: 3 },
      order: { resource_id: "ASC" },
    });
    expect(inventoryAlertView.find).toHaveBeenCalledWith({
      where: { camp_id: 3 },
      order: { resource_id: "ASC" },
    });
    expect(transferSummaryView.findOne).toHaveBeenCalledWith({
      where: { camp_id: 3 },
    });
    expect(result).toMatchObject({
      campId: 3,
      role: "admin",
      camp: {
        totalPeople: 15,
        activeWorkers: 10,
        unavailablePeople: 5,
        campCapacity: 20,
        occupancyRate: 75.5,
        activeExplorations: 2,
      },
      warehouse: {
        totalResourceTypes: 2,
        resourcesWithAlerts: 1,
        inventoryTotalQuantity: 12,
        criticalResources: [
          {
            resourceId: 2,
            resourceName: "Agua",
            currentQuantity: 4,
            minimumRequired: 6,
          },
        ],
      },
      transfers: {
        pendingTransfers: 3,
        approvedTransfers: 1,
        completedTransfers: 7,
      },
    });
    expect(result.generatedAt).toBeInstanceOf(Date);
  });

  it("should return null occupancy rate and zero transfer metrics when summary is missing", async () => {
    campPopulationView.findOne.mockResolvedValue({
      camp_id: 9,
      total_people: 4,
      active_workers: 1,
      unavailable_people: 3,
      max_capacity: null,
      occupancy_rate: 0,
    });
    explorationSummaryView.count.mockResolvedValue(0);
    inventoryStatusView.find.mockResolvedValue([]);
    inventoryAlertView.find.mockResolvedValue([]);
    transferSummaryView.findOne.mockResolvedValue(null);

    const result = await service.getMetricsByCamp(9, "gestor_recursos");

    expect(result.camp).toEqual({
      totalPeople: 4,
      activeWorkers: 1,
      unavailablePeople: 3,
      campCapacity: null,
      occupancyRate: null,
      activeExplorations: 0,
    });
    expect(result.warehouse).toEqual({
      totalResourceTypes: 0,
      resourcesWithAlerts: 0,
      inventoryTotalQuantity: 0,
      criticalResources: [],
    });
    expect(result.transfers).toEqual({
      pendingTransfers: 0,
      approvedTransfers: 0,
      completedTransfers: 0,
    });
  });

  it("should throw NotFoundException when the camp summary does not exist", async () => {
    campPopulationView.findOne.mockResolvedValue(null);

    await expect(service.getMetricsByCamp(77, "admin")).rejects.toThrow(
      new NotFoundException("Camp with ID 77 was not found"),
    );

    expect(explorationSummaryView.count).not.toHaveBeenCalled();
    expect(inventoryStatusView.find).not.toHaveBeenCalled();
    expect(inventoryAlertView.find).not.toHaveBeenCalled();
    expect(transferSummaryView.findOne).not.toHaveBeenCalled();
  });
});