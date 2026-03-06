import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profession } from '../entities/profession.entity';
import { CreateProfessionDto } from '../dto/create-profession.dto';
import { PersonsService } from './persons.service';

/**
 * Servicio especializado en la gestión de profesiones
 * Responsabilidad: CRUD de profesiones y alertas de trabajadores
 */
@Injectable()
export class ProfessionsService {
  constructor(
    @InjectRepository(Profession)
    private readonly professionRepo: Repository<Profession>,
    private readonly personsService: PersonsService,
  ) {}

  // ==================== CRUD OPERATIONS ====================

  async findAll(): Promise<Profession[]> {
    return this.professionRepo.find({
      relations: ['persons'],
    });
  }

  async findById(id: number): Promise<Profession> {
    const profession = await this.professionRepo.findOne({
      where: { id },
      relations: ['persons'],
    });

    if (!profession) {
      throw new NotFoundException(`Profession with ID ${id} not found`);
    }

    return profession;
  }

  async create(dto: CreateProfessionDto): Promise<Profession> {
    const profession = this.professionRepo.create(dto);
    return this.professionRepo.save(profession);
  }

  // ==================== WORKER MANAGEMENT ====================

  /**
   * Verifica si una profesión tiene el mínimo de trabajadores activos
   * Si no, genera una alerta/excepción
   */
  async checkMinimumWorkers(
    professionId: number,
    excludePersonId?: number,
  ): Promise<{ needsWorkers: boolean; currentWorkers: number; minimumRequired: number }> {
    const profession = await this.findById(professionId);

    // Contar trabajadores activos (excluyendo el que se va si es el caso)
    const activeWorkers = await this.personsService.countActiveWorkers(
      professionId,
      excludePersonId,
    );

    const needsWorkers = activeWorkers < profession.minimum_active_required;

    if (needsWorkers) {
      // Aquí podrías enviar notificaciones, crear tareas automáticas, etc.
      console.warn(
        `⚠️ ALERTA: Profesión "${profession.name}" necesita trabajadores. ` +
          `Actual: ${activeWorkers}, Mínimo: ${profession.minimum_active_required}`,
      );
    }

    return {
      needsWorkers,
      currentWorkers: activeWorkers,
      minimumRequired: profession.minimum_active_required,
    };
  }

  /**
   * Obtiene profesiones que necesitan trabajadores urgentemente
   */
  async getProfessionsNeedingWorkers(): Promise<
    Array<{
      profession: Profession;
      currentWorkers: number;
      minimumRequired: number;
      deficit: number;
    }>
  > {
    const allProfessions = await this.findAll();
    const professionsNeedingWorkers = [];

    for (const profession of allProfessions) {
      const activeWorkers = await this.personsService.countActiveWorkers(profession.id);

      if (activeWorkers < profession.minimum_active_required) {
        professionsNeedingWorkers.push({
          profession,
          currentWorkers: activeWorkers,
          minimumRequired: profession.minimum_active_required,
          deficit: profession.minimum_active_required - activeWorkers,
        });
      }
    }

    return professionsNeedingWorkers;
  }

  /**
   * Obtiene profesiones con exceso de trabajadores (candidatos para asignación temporal)
   */
  async getProfessionsWithExcess(): Promise<
    Array<{
      profession: Profession;
      currentWorkers: number;
      minimumRequired: number;
      excess: number;
    }>
  > {
    const allProfessions = await this.findAll();
    const professionsWithExcess = [];

    for (const profession of allProfessions) {
      const activeWorkers = await this.personsService.countActiveWorkers(profession.id);

      if (activeWorkers > profession.minimum_active_required) {
        professionsWithExcess.push({
          profession,
          currentWorkers: activeWorkers,
          minimumRequired: profession.minimum_active_required,
          excess: activeWorkers - profession.minimum_active_required,
        });
      }
    }

    return professionsWithExcess;
  }
}
