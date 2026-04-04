import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CampsController } from "./camps.controller";
import { CampsService } from "./camps.service";
import { Camp } from "./entities/camp.entity";
import { Inventory } from "../resources/entities/inventory.entity";
import { Resource } from "../resources/entities/resource.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Camp, Inventory, Resource])],
  controllers: [CampsController],
  providers: [CampsService],
  exports: [CampsService],
})
export class CampsModule {}
