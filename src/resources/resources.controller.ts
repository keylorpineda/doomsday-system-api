import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  // TODO: agregar endpoints
}
