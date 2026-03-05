import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { IntercampRequest } from './entities/intercamp-request.entity';
import { RequestResourceDetail } from './entities/request-resource-detail.entity';
import { RequestPersonDetail } from './entities/request-person-detail.entity';
import { Approval } from './entities/approval.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IntercampRequest,
      RequestResourceDetail,
      RequestPersonDetail,
      Approval,
    ]),
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
