import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { IoAdapter } from '@nestjs/platform-socket.io'
import * as cookie from 'cookie'
import { ServerOptions, Socket } from 'socket.io'

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string
      email: string
      roles: string[]
    }
  }
}

@Injectable()
export class WsJwtMiddleware {
  private readonly logger = new Logger(WsJwtMiddleware.name)

  constructor(private readonly jwtService: JwtService) {}

  // Call this inside your gateway's afterInit()
  apply() {
    return async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
      try {
        // Socket.io handshake is an HTTP request — cookie arrives here
        const rawCookie = socket.handshake.headers.cookie ?? ''
        const cookies = cookie.parse(rawCookie)
        const token = cookies['access_token']

        if (!token) {
          return next(new Error('No auth token'))
        }

        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        })

        // Attach user to socket for use in all event handlers
        socket.data.user = {
          id: payload.sub,
          email: payload.email,
          roles: payload.roles ?? [],
        }

        this.logger.debug(`WS connected: ${payload.email}`)
        next()
      } catch (err) {
        this.logger.warn(`WS auth failed: ${err.message}`)
        // Returning an Error to next() causes Socket.io to reject the upgrade
        next(new Error('Unauthorized'))
      }
    }
  }
}
