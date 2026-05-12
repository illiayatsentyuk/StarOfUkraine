import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { TournamentGateway } from './tournament.gateway';

@Module({
  controllers: [EventsController],
  providers: [TournamentGateway],
})
export class GatewayModule {}
