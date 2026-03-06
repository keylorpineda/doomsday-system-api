import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CampsService } from './camps.service';

@ApiTags('camps')
@Controller('camps')
export class CampsController {
  constructor(private readonly campsService: CampsService) {}

  // TODO: agregar endpoints
}
