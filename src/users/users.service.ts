import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccount } from './entities/user-account.entity';
import { Person } from './entities/person.entity';
import { Profession } from './entities/profession.entity';
import { TemporaryAssignment } from './entities/temporary-assignment.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { UpdatePersonStatusDto } from './dto/update-person-status.dto';
import { CreateTemporaryAssignmentDto } from './dto/create-temporary-assignment.dto';
import { PersonsService } from './services/persons.service';
import { ProfessionsService } from './services/professions.service';
import { AssignmentsService } from './services/assignments.service';
import { ProductionService } from './services/production.service';

/**
 * Servicio principal de usuarios - Actúa como orquestador
 * Delega responsabilidades específicas a servicios especializados
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserAccount)
    private readonly userAccountRepo: Repository<UserAccount>,
    private readonly personsService: PersonsService,
    private readonly professionsService: ProfessionsService,
    private readonly assignmentsService: AssignmentsService,
    private readonly productionService: ProductionService,
  ) {}

  // ==================== USER ACCOUNT ====================

  async findUserById(id: number): Promise<UserAccount | null> {
    return this.userAccountRepo.findOne({
      where: { id },
      relations: ['role', 'person', 'person.profession', 'camp'],
    });
  }

  async findUserByUsername(username: string): Promise<UserAccount | null> {
    return this.userAccountRepo.findOne({
      where: { username },
      relations: ['role', 'person', 'person.profession', 'camp'],
    });
  }

  // ==================== PERSON CRUD ====================
  // Delegados a PersonsService

  async createPerson(dto: CreatePersonDto): Promise<Person> {
    return this.personsService.create(dto);
  }

  async findAllPersons(campId?: number): Promise<Person[]> {
    return this.personsService.findAll(campId);
  }

  async findPersonById(id: number): Promise<Person> {
    return this.personsService.findById(id);
  }

  async updatePerson(id: number, dto: UpdatePersonDto): Promise<Person> {
    return this.personsService.update(id, dto);
  }

  async updatePersonStatus(id: number, dto: UpdatePersonStatusDto): Promise<Person> {
    return this.personsService.updateStatus(id, dto);
  }

  async deletePerson(id: number): Promise<void> {
    return this.personsService.delete(id);
  }

  async getPersonStatsByStatus(campId?: number): Promise<Array<{ status: string; count: number }>> {
    return this.personsService.getStatsByStatus(campId);
  }

  async getPersonStatsByProfession(
    campId?: number,
  ): Promise<Array<{ professionName: string; total: number; active: number; inactive: number }>> {
    return this.personsService.getStatsByProfession(campId);
  }

  // ==================== PROFESSION MANAGEMENT ====================
  // Delegados a ProfessionsService

  async findAllProfessions(): Promise<Profession[]> {
    return this.professionsService.findAll();
  }

  async findProfessionById(id: number): Promise<Profession> {
    return this.professionsService.findById(id);
  }

  async createProfession(data: {
    name: string;
    can_explore?: boolean;
    minimum_active_required?: number;
  }): Promise<Profession> {
    return this.professionsService.create(data);
  }

  async checkProfessionMinimumWorkers(
    professionId: number,
    excludePersonId?: number,
  ): Promise<{ needsWorkers: boolean; currentWorkers: number; minimumRequired: number }> {
    return this.professionsService.checkMinimumWorkers(professionId, excludePersonId);
  }

  async getProfessionsNeedingWorkers(): Promise<
    Array<{
      profession: Profession;
      currentWorkers: number;
      minimumRequired: number;
      deficit: number;
    }>
  > {
    return this.professionsService.getProfessionsNeedingWorkers();
  }

  async getProfessionsWithExcess(): Promise<
    Array<{
      profession: Profession;
      currentWorkers: number;
      minimumRequired: number;
      excess: number;
    }>
  > {
    return this.professionsService.getProfessionsWithExcess();
  }

  // ==================== TEMPORARY ASSIGNMENTS ====================
  // Delegados a AssignmentsService

  async createTemporaryAssignment(
    dto: CreateTemporaryAssignmentDto,
    approvedByUserId: number,
  ): Promise<TemporaryAssignment> {
    return this.assignmentsService.create(dto, approvedByUserId);
  }

  async getActiveTemporaryAssignments(campId?: number): Promise<TemporaryAssignment[]> {
    return this.assignmentsService.findActive(campId);
  }

  async endTemporaryAssignment(assignmentId: number): Promise<TemporaryAssignment> {
    return this.assignmentsService.end(assignmentId);
  }

  // ==================== PRODUCTION & CONSUMPTION ====================
  // Delegados a ProductionService

  async calculateDailyProduction(campId: number): Promise<{
    totalFood: number;
    totalWater: number;
    byProfession: Array<{
      professionName: string;
      workers: number;
      foodProduction: number;
      waterProduction: number;
    }>;
  }> {
    return this.productionService.calculateDailyProduction(campId);
  }

  async calculateDailyConsumption(campId: number): Promise<{
    totalFood: number;
    totalWater: number;
    totalPersons: number;
  }> {
    return this.productionService.calculateDailyConsumption(campId);
  }

  async calculateDailyBalance(campId: number): Promise<{
    production: { food: number; water: number };
    consumption: { food: number; water: number };
    balance: { food: number; water: number };
    persons: number;
  }> {
    return this.productionService.calculateDailyBalance(campId);
  }
}
