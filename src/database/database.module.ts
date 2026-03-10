import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CampPopulationSummaryView,
  PersonStatusStatsView,
  PersonProfessionStatsView,
  InventoryStatusView,
  InventoryAlertView,
  TransferCampSummaryView,
  ExplorationSummaryView,
  ActiveTemporaryAssignmentView,
} from './views';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CampPopulationSummaryView,
      PersonStatusStatsView,
      PersonProfessionStatsView,
      InventoryStatusView,
      InventoryAlertView,
      TransferCampSummaryView,
      ExplorationSummaryView,
      ActiveTemporaryAssignmentView,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
