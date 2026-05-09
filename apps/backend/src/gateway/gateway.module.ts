import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WsAuthGuard } from '../common/guards';
import { WsJwtMiddleware } from '../middleware';
import { TournamentGateway } from './tournament.gateway';

@Module({
  imports: [AuthModule],
  providers: [WsJwtMiddleware, WsAuthGuard, TournamentGateway],
})
export class GatewayModule {}
