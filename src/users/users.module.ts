import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Person } from './entities/person.entity';
import { Profession } from './entities/profession.entity';
import { Role } from './entities/role.entity';
import { UserAccount } from './entities/user-account.entity';
import { TemporaryAssignment } from './entities/temporary-assignment.entity';

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
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
