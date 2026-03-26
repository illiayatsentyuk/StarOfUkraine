import { Module } from '@nestjs/common'
import { WsAuthGuard } from '../common/guards'
import { WsJwtMiddleware } from '../middleware'
import { ChatGateway } from './chat.gateway'

@Module({
  providers: [ChatGateway, WsJwtMiddleware, WsAuthGuard],
})
export class GatewayModule {}
