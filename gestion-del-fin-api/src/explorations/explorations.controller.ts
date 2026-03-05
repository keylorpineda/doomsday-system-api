import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExplorationsService } from './explorations.service';

@ApiTags('explorations')
@Controller({ path: 'explorations', version: '1' })
export class ExplorationsController {
  constructor(private readonly explorationsService: ExplorationsService) {}

  // TODO: agregar endpoints
}
