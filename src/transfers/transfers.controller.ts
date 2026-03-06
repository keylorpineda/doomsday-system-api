import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';

@ApiTags('transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  // TODO: agregar endpoints
}
