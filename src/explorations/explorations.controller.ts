import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExplorationsService } from './explorations.service';

@ApiTags('explorations')
@Controller('explorations')
export class ExplorationsController {
  constructor(private readonly explorationsService: ExplorationsService) {}

  // TODO: agregar endpoints
}
