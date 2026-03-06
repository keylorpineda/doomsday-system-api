import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Camp } from './entities/camp.entity';
import { Inventory } from '../resources/entities/inventory.entity';
import { Resource } from '../resources/entities/resource.entity';
import { CreateCampDto } from './dto/create-camp.dto';
import { UpdateCampDto } from './dto/update-camp.dto';

@Injectable()
export class CampsService {
  constructor(
    @InjectRepository(Camp)
    private readonly campRepo: Repository<Camp>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Resource)
    private readonly resourceRepo: Repository<Resource>,
    private readonly dataSource: DataSource,
  ) {}


   //Crea un campamento e inicializa su inventario con todos los recursos
   //existentes en cantidad 0. Usa transacción para garantizar consistencia.
   
  async create(dto: CreateCampDto): Promise<Camp> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const camp = queryRunner.manager.create(Camp, {
        ...dto,
        active: true,
        foundation_date: dto.foundation_date
          ? new Date(dto.foundation_date)
          : new Date(),
      });
      const savedCamp = await queryRunner.manager.save(Camp, camp);

      // Inicializar inventario vacío por cada recurso existente
      const resources = await queryRunner.manager.find(Resource);
      if (resources.length > 0) {
        const inventoryEntries = resources.map((resource: Resource) =>
          queryRunner.manager.create(Inventory, {
            camp_id: Number(savedCamp.id),
            resource_id: Number(resource.id),
            current_quantity: 0,
            minimum_stock_required: 0,
            alert_active: false,
            last_update: new Date(),
          }),
        );
        await queryRunner.manager.save(Inventory, inventoryEntries);
      }

      await queryRunner.commitTransaction();
      return savedCamp;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        'Error al crear el campamento: ' + (error as Error).message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  
   //Lista todos los campamentos activos.
   
  async findAll(): Promise<Camp[]> {
    return this.campRepo.find({
      where: { active: true },
      order: { id: 'ASC' },
    });
  }

  
   //Detalle de un campamento con métricas de su inventario.
   
  async findOne(id: number): Promise<{
    camp: Camp;
    metrics: {
      totalResources: number;
      resourcesWithAlerts: number;
      inventorySummary: {
        resource: string;
        quantity: number;
        unit: string;
        alert: boolean;
      }[];
    };
  }> {
    const camp = await this.campRepo.findOne({ where: { id, active: true } });
    if (!camp) throw new NotFoundException(`Campamento #${id} no encontrado`);

    const inventory = await this.inventoryRepo.find({
      where: { camp_id: id },
      relations: ['resource'],
      order: { resource_id: 'ASC' },
    });

    const inventorySummary = inventory.map((inv: Inventory) => ({
      resource: inv.resource?.name ?? 'Desconocido',
      quantity: Number(inv.current_quantity),
      unit: inv.resource?.unit ?? '',
      alert: inv.alert_active,
    }));

    return {
      camp,
      metrics: {
        totalResources: inventory.length,
        resourcesWithAlerts: inventory.filter((i: Inventory) => i.alert_active).length,
        inventorySummary,
      },
    };
  }

  
  //Actualiza los datos de un campamento.
  
  async update(id: number, dto: UpdateCampDto): Promise<Camp> {
    const camp = await this.campRepo.findOne({ where: { id } });
    if (!camp) throw new NotFoundException(`Campamento #${id} no encontrado`);

    const updated = Object.assign(camp, {
      ...dto,
      foundation_date: dto.foundation_date
        ? new Date(dto.foundation_date)
        : camp.foundation_date,
    });

    return this.campRepo.save(updated);
  }

  
   //Desactiva un campamento (soft delete). No elimina datos de BD.
   
  async remove(id: number): Promise<{ message: string }> {
    const camp = await this.campRepo.findOne({ where: { id, active: true } });
    if (!camp)
      throw new NotFoundException(
        `Campamento #${id} no encontrado o ya desactivado`,
      );

    camp.active = false;
    await this.campRepo.save(camp);

    return { message: `Campamento "${camp.name}" desactivado correctamente` };
  }
}
//Falta Middleware de contexto de campamento (requiere auth funcionando)
//Métricas de personas en findOne
