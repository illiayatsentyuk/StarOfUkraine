import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WsAuthGuard } from '../common/guards';
import { WsJwtMiddleware } from '../middleware';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [AuthModule],
  providers: [ChatGateway, WsJwtMiddleware, WsAuthGuard],
})
export class GatewayModule {}
