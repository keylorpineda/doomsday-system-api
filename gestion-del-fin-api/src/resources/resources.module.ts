import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { Resource } from './entities/resource.entity';
import { Inventory } from './entities/inventory.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Resource, Inventory, InventoryMovement])],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService, TypeOrmModule],
})
export class ResourcesModule {}
