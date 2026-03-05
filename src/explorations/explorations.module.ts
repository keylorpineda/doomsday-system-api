import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExplorationsController } from './explorations.controller';
import { ExplorationsService } from './explorations.service';
import { Exploration } from './entities/exploration.entity';
import { ExplorationPerson } from './entities/exploration-person.entity';
import { ExplorationResource } from './entities/exploration-resource.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exploration, ExplorationPerson, ExplorationResource]),
  ],
  controllers: [ExplorationsController],
  providers: [ExplorationsService],
  exports: [ExplorationsService],
})
export class ExplorationsModule {}
