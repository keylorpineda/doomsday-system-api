import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { Camp } from "../camps/entities/camp.entity";
import { Person } from "../users/entities/person.entity";
import { Inventory } from "../resources/entities/inventory.entity";
import { Exploration } from "../explorations/entities/exploration.entity";
import { IntercampRequest } from "../transfers/entities/intercamp-request.entity";

@Module({imports: [
    TypeOrmModule.forFeature([
      Camp,
      Person,
      Inventory,
      Exploration,
      IntercampRequest,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}