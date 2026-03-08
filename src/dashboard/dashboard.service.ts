import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Camp } from '../camps/entities/camp.entity';
import { Person } from '../users/entities/person.entity';
import { Inventory } from '../resources/entities/inventory.entity';
import { Exploration } from '../explorations/entities/exploration.entity';
import { IntercampRequest } from '../transfers/entities/intercamp-request.entity';
import { PersonStatus } from '../users/constants/professions.constants';

interface CampMetrics {
  totalPeople: number;
  activeWorkers: number;
  unavailablePeople: number;
  campCapacity: number | null;
  occupancyRate: number | null;
  activeExplorations: number;
}

interface WarehouseMetrics {
  totalResourceTypes: number;
  resourcesWithAlerts: number;
  inventoryTotalQuantity: number;
  criticalResources: Array<{
    resourceId: number;
    resourceName: string;
    currentQuantity: number;
    minimumRequired: number;
  }>;
}

interface TransfersMetrics {
  pendingTransfers: number;
  approvedTransfers: number;
  completedTransfers: number;
}

export interface DashboardMetricsResponse {
  campId: number;
  role: string;
  generatedAt: Date;
  camp: CampMetrics;
  warehouse: WarehouseMetrics | null;
  transfers: TransfersMetrics;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Camp)
    private readonly campRepo: Repository<Camp>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Exploration)
    private readonly explorationRepo: Repository<Exploration>,
    @InjectRepository(IntercampRequest)
    private readonly transferRepo: Repository<IntercampRequest>,
  ) {}

  async getMetricsByCamp(
    campId: number,
    role: string,
  ): Promise<DashboardMetricsResponse> {
    const camp = await this.campRepo.findOne({
      where: { id: campId, active: true },
    });

    if (!camp) {
      throw new NotFoundException(`Camp with ID ${campId} was not found`);
    }

    const campMetrics = await this.buildCampMetrics(campId, camp.max_capacity);
    const warehouse = await this.buildWarehouseMetrics(campId);
    const transfers = await this.buildTransferMetrics(campId);

    return {
      campId,
      role,
      generatedAt: new Date(),
      camp: campMetrics,
      warehouse,
      transfers,
    };
  }

  private async buildCampMetrics(
    campId: number,
    maxCapacity: number | null,
  ): Promise<CampMetrics> {
    const totalPeople = await this.personRepo
      .createQueryBuilder('person')
      .leftJoin('person.userAccount', 'userAccount')
      .where('userAccount.camp_id = :campId', { campId })
      .andWhere('person.status != :deceased', {
        deceased: PersonStatus.DECEASED,
      })
      .getCount();

    const activeWorkers = await this.personRepo
      .createQueryBuilder('person')
      .leftJoin('person.userAccount', 'userAccount')
      .where('userAccount.camp_id = :campId', { campId })
      .andWhere('person.can_work = :canWork', { canWork: true })
      .andWhere('person.status = :status', { status: PersonStatus.ACTIVE })
      .getCount();

    const activeExplorations = await this.explorationRepo.count({
      where: {
        camp_id: campId,
        status: 'in_progress',
      },
    });

    return {
      totalPeople,
      activeWorkers,
      unavailablePeople: totalPeople - activeWorkers,
      campCapacity: maxCapacity ?? null,
      occupancyRate:
        maxCapacity && maxCapacity > 0
          ? Number(((totalPeople / maxCapacity) * 100).toFixed(2))
          : null,
      activeExplorations,
    };
  }

  private async buildWarehouseMetrics(
    campId: number,
  ): Promise<WarehouseMetrics> {
    const inventory = await this.inventoryRepo.find({
      where: { camp_id: campId },
      relations: ['resource'],
      order: { resource_id: 'ASC' },
    });

    const criticalResources = inventory
      .filter((item) => item.alert_active)
      .map((item) => ({
        resourceId: Number(item.resource_id),
        resourceName: item.resource?.name ?? 'Unknown',
        currentQuantity: Number(item.current_quantity),
        minimumRequired: Number(item.minimum_stock_required),
      }));

    const inventoryTotalQuantity = inventory.reduce(
      (acc, item) => acc + Number(item.current_quantity),
      0,
    );

    return {
      totalResourceTypes: inventory.length,
      resourcesWithAlerts: criticalResources.length,
      inventoryTotalQuantity,
      criticalResources,
    };
  }

  private async buildTransferMetrics(campId: number): Promise<TransfersMetrics> {
    const [pendingTransfers, approvedTransfers, completedTransfers] =
      await Promise.all([
        this.transferRepo
          .createQueryBuilder('request')
          .where(
            '(request.camp_origin_id = :campId OR request.camp_destination_id = :campId)',
            { campId },
          )
          .andWhere('request.status = :status', { status: 'pending' })
          .getCount(),
        this.transferRepo
          .createQueryBuilder('request')
          .where(
            '(request.camp_origin_id = :campId OR request.camp_destination_id = :campId)',
            { campId },
          )
          .andWhere('request.status = :status', { status: 'approved' })
          .getCount(),
        this.transferRepo
          .createQueryBuilder('request')
          .where(
            '(request.camp_origin_id = :campId OR request.camp_destination_id = :campId)',
            { campId },
          )
          .andWhere('request.status = :status', { status: 'completed' })
          .getCount(),
      ]);

    return {
      pendingTransfers,
      approvedTransfers,
      completedTransfers,
    };
  }
}