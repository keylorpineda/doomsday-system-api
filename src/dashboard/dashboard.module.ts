import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { DatabaseModule } from "../database/database.module";
import {
  CampPopulationSummaryView,
  InventoryStatusView,
  InventoryAlertView,
  TransferCampSummaryView,
  ExplorationSummaryView,
} from "../database/views";

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      CampPopulationSummaryView,
      InventoryStatusView,
      InventoryAlertView,
      TransferCampSummaryView,
      ExplorationSummaryView,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
