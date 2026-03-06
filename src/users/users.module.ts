import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Person } from './entities/person.entity';
import { Profession } from './entities/profession.entity';
import { Role } from './entities/role.entity';
import { UserAccount } from './entities/user-account.entity';
import { TemporaryAssignment } from './entities/temporary-assignment.entity';
import { ProfessionsSeeder } from './seeders/professions.seeder';
import { PersonsService } from './services/persons.service';
import { ProfessionsService } from './services/professions.service';
import { AssignmentsService } from './services/assignments.service';
import { ProductionService } from './services/production.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Person,
      Profession,
      Role,
      UserAccount,
      TemporaryAssignment,
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    PersonsService,
    ProfessionsService,
    AssignmentsService,
    ProductionService,
    ProfessionsSeeder,
  ],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
