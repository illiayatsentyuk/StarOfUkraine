import { Module } from '@nestjs/common'
import { WsAuthGuard } from '../common/guards'
import { WsJwtMiddleware } from '../middleware'
import { ChatGateway } from './chat.gateway'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  providers: [ChatGateway, WsJwtMiddleware, WsAuthGuard],
})
export class GatewayModule {}
