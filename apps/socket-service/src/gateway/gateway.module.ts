import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WsAuthGuard } from '../guards/ws-auth.guard';
import { WsJwtMiddleware } from '../middleware/ws-jwt.middleware';
import { EventsController } from './events.controller';
import { TournamentGateway } from './tournament.gateway';

@Module({
  imports: [
    JwtModule.register({}),
  ],
  controllers: [EventsController],
  providers: [TournamentGateway, WsJwtMiddleware, WsAuthGuard],
})
export class GatewayModule {}
