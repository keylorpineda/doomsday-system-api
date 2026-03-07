import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IntercampRequest } from '../entities/intercamp-request.entity';
import { RequestResourceDetail } from '../entities/request-resource-detail.entity';
import { RequestPersonDetail } from '../entities/request-person-detail.entity';
import { Person } from '../../users/entities/person.entity';
import { UserAccount } from '../../users/entities/user-account.entity';
import { Inventory } from '../../resources/entities/inventory.entity';
import { InventoryMovement } from '../../resources/entities/inventory-movement.entity';
import { AuditLog } from '../../common/entities/audit-log.entity';

@Injectable()
export class TransferExecutionService {
  constructor(
    @InjectRepository(IntercampRequest)
    private readonly requestRepo: Repository<IntercampRequest>,
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
    @InjectRepository(UserAccount)
    private readonly userRepo: Repository<UserAccount>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepo: Repository<InventoryMovement>,
    @InjectRepository(RequestResourceDetail)
    private readonly resourceDetailRepo: Repository<RequestResourceDetail>,
    @InjectRepository(RequestPersonDetail)
    private readonly personDetailRepo: Repository<RequestPersonDetail>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    private readonly dataSource: DataSource,
  ) {}

  async executeTransfer(
    request: IntercampRequest,
    userId: number,
  ): Promise<void> {
    if (request.status !== 'approved') {
      throw new BadRequestException(
        'La solicitud debe estar aprobada por ambos campamentos',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (request.resourceDetails && request.resourceDetails.length > 0) {
        await this.transferResources(queryRunner, request, userId);
      }

      if (request.personDetails && request.personDetails.length > 0) {
        await this.transferPersons(queryRunner, request);
      }

      request.status = 'completed';
      await queryRunner.manager.save(IntercampRequest, request);

      await queryRunner.manager.save(AuditLog, {
        user_id: userId,
        camp_id: request.camp_origin_id,
        action: 'intercamp_transfer_executed',
        entity_type: 'intercamp_request',
        entity_id: Number(request.id),
        new_value: {
          resources_transferred: request.resourceDetails?.length ?? 0,
          persons_transferred: request.personDetails?.length ?? 0,
        },
        date: new Date(),
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async transferResources(
    queryRunner: any,
    request: IntercampRequest,
    userId: number,
  ): Promise<void> {
    for (const rd of request.resourceDetails!) {
      const originInv = await queryRunner.manager.findOne(Inventory, {
        where: {
          camp_id: request.camp_origin_id,
          resource_id: Number(rd.resource_id),
        },
      });

      if (!originInv) {
        throw new NotFoundException(
          `Inventario origen no encontrado para recurso ${rd.resource_id}`,
        );
      }

      const transferQty = Number(rd.requested_quantity);

      if (Number(originInv.current_quantity) < transferQty) {
        throw new BadRequestException(
          `Recurso insuficiente en origen: ${rd.resource.name}`,
        );
      }

      originInv.current_quantity =
        Number(originInv.current_quantity) - transferQty;
      originInv.alert_active =
        Number(originInv.current_quantity) <
        Number(originInv.minimum_stock_required);
      originInv.last_update = new Date();
      await queryRunner.manager.save(Inventory, originInv);

      await queryRunner.manager.save(InventoryMovement, {
        camp_id: request.camp_origin_id,
        resource_id: Number(rd.resource_id),
        quantity: transferQty,
        type: 'transfer_out',
        description: `Transferencia a ${request.campDestination.name} (Solicitud #${request.id})`,
        date: new Date(),
        user_id: userId,
      });

      let destInv = await queryRunner.manager.findOne(Inventory, {
        where: {
          camp_id: request.camp_destination_id,
          resource_id: Number(rd.resource_id),
        },
      });

      if (!destInv) {
        destInv = queryRunner.manager.create(Inventory, {
          camp_id: request.camp_destination_id,
          resource_id: Number(rd.resource_id),
          current_quantity: 0,
          minimum_stock_required: 0,
          alert_active: false,
          last_update: new Date(),
        });
      }

      destInv.current_quantity = Number(destInv.current_quantity) + transferQty;
      destInv.alert_active =
        Number(destInv.current_quantity) <
        Number(destInv.minimum_stock_required);
      destInv.last_update = new Date();
      await queryRunner.manager.save(Inventory, destInv);

      await queryRunner.manager.save(InventoryMovement, {
        camp_id: request.camp_destination_id,
        resource_id: Number(rd.resource_id),
        quantity: transferQty,
        type: 'transfer_in',
        description: `Transferencia desde ${request.campOrigin.name} (Solicitud #${request.id})`,
        date: new Date(),
        user_id: userId,
      });

      rd.approved_quantity = transferQty;
      rd.received_quantity = transferQty;
      await queryRunner.manager.save(RequestResourceDetail, rd);
    }
  }

  private async transferPersons(
    queryRunner: any,
    request: IntercampRequest,
  ): Promise<void> {
    for (const pd of request.personDetails!) {
      const person = await queryRunner.manager.findOne(Person, {
        where: { id: pd.person_id },
        relations: ['userAccount'],
      });

      if (!person) {
        throw new NotFoundException(
          `Persona con ID ${pd.person_id} no encontrada`,
        );
      }

      if (person.userAccount) {
        person.userAccount.camp_id = request.camp_destination_id;
        await queryRunner.manager.save(UserAccount, person.userAccount);
      }

      pd.transfer_status = 'completed';
      await queryRunner.manager.save(RequestPersonDetail, pd);
    }
  }
}
