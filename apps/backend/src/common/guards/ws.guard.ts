import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { WsException } from '@nestjs/websockets'
import { AuthenticatedSocket } from '../../middleware'

export const Roles = (...roles: string[]) => Reflect.metadata('roles', roles)

// Attach with @UseGuards(WsAuthGuard) on a gateway or individual @SubscribeMessage
@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name)

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AuthenticatedSocket>()
    const user = client.data?.user

    if (!user) {
      this.logger.warn('WS event rejected — no user on socket')
      throw new WsException('Unauthorized')
    }

    // Check @Roles() decorator if present on this handler
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    )

    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((r) => user.roles.includes(r))
      if (!hasRole) {
        this.logger.warn(
          `WS event rejected — user ${user.email} lacks roles [${requiredRoles}]`,
        )
        throw new WsException('Forbidden')
      }
    }

    return true
  }
}
