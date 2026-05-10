import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as cookie from 'cookie';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      email: string;
      roles: string[];
    };
  };
}

@Injectable()
export class WsJwtMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    @InjectPinoLogger(WsJwtMiddleware.name)
    private readonly logger: PinoLogger,
  ) {}

  apply() {
    return async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
      try {
        const rawCookie = socket.handshake.headers.cookie ?? '';
        const cookies = cookie.parse(rawCookie);
        const token = cookies['access_token'];

        if (!token) {
          this.logger.warn(
            { socketId: socket.id },
            'WebSocket handshake missing access_token',
          );
          return next(new Error('No auth token'));
        }

        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET,
        });

        socket.data.user = {
          id: payload.sub,
          email: payload.email,
          roles: payload.roles ?? [],
        };

        this.logger.debug(
          { socketId: socket.id, userId: payload.sub },
          'WebSocket JWT verified',
        );
        next();
      } catch (err: unknown) {
        this.logger.warn(
          { err, socketId: socket.id },
          'WebSocket JWT verification failed',
        );
        next(new Error('Unauthorized'));
      }
    };
  }
}
