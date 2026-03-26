import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { AppService } from './app.service'
import { Public } from './common/decorators'

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
    schema: { example: {
      "ok": true,
      "message": "Server is running",
      "version": "1.0.0",
    } },
  })
  getHello() {
    return this.appService.getHello()
  }
}
