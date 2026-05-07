import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller('redis-test')
export class RedisTestController {
    @EventPattern('test_event')
    handleTestEvent(data: any) {
      console.log('Received event:', data);
    }
}
