import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators';
import { appExamples } from './examples';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check / hello endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is reachable',
    schema: { example: appExamples.healthResponse },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
