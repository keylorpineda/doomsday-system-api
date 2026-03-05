import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';

@ApiTags('resources')
@Controller({ path: 'resources', version: '1' })
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  // TODO: agregar endpoints
}
