import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';

@ApiTags('transfers')
@Controller({ path: 'transfers', version: '1' })
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  // TODO: agregar endpoints
}
