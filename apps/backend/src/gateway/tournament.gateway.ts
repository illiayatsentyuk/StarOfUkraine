import { Injectable, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from 'src/common/guards/ws.guard';
import { RoomInfo } from 'src/common/types/room-info.interface';
import { WsJwtMiddleware } from 'src/middleware/ws-jwt.middleware';
import type { BroadcastPayload, MessagePayload } from '../common/types';

@UseGuards(WsAuthGuard)
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TournamentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private rooms: Map<string, RoomInfo> = new Map();

  constructor(
    private readonly wsJwtMiddleware: WsJwtMiddleware,
    @InjectPinoLogger(TournamentGateway.name)
    private readonly logger: PinoLogger,
  ) {}

  afterInit() {
    this.server.use(this.wsJwtMiddleware.apply());
    this.logger.info('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.info({ socketId: client.id }, 'WebSocket client connected');
  }

  handleDisconnect(client: Socket) {
    this.logger.info({ socketId: client.id }, 'WebSocket client disconnected');
  }

  @SubscribeMessage('broadcast')
  handleBroadcast(
    @MessageBody() data: BroadcastPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    this.server.emit('broadcast', {
      message: `Broadcast to all: ${data?.message || 'No message'}`,
      timestamp: new Date().toISOString(),
      fromClient: client.id,
    });
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string | MessagePayload,
    @ConnectedSocket() client: Socket,
  ): string {
    this.logger.debug({ socketId: client.id }, 'WebSocket message received');

    let originalMsg: string | undefined;
    if (data && typeof data === 'string') {
      originalMsg = JSON.parse(data)?.message;
    }
    if (data && typeof data === 'object') {
      originalMsg = data?.message;
    }

    this.server.to(client.id).emit('message', {
      originalMsg,
      timestamp: new Date().toISOString(),
    });

    return 'Message received';
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; username?: string } = {
      roomId: '1',
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    client.join(roomId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        roomId,
        clients: new Set([client.id]),
        createdAt: new Date(),
        lastActivity: new Date(),
      });
    }

    const room = this.rooms.get(roomId);
    if (room) {
      room.clients.add(client.id);
      room.lastActivity = new Date();
    }

    this.server.to(roomId).emit('joinRoom', {
      roomId,
      clientId: client.id,
      clientsInRoom: room?.clients.size || 0,
    });

    this.logger.info({ socketId: client.id, roomId }, 'Client joined room');

    return {
      success: true,
      message: `Joined room ${roomId}`,
      roomInfo: room,
    };
  }

  @SubscribeMessage('roomMessage')
  handleRoomMessage(
    @MessageBody() data: { roomId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, message } = data;

    const room = this.rooms.get(roomId);

    if (!room?.clients.has(client.id) || !client.rooms.has(roomId)) {
      this.server
        .to(client.id)
        .emit('roomMessage', { error: 'You are not in this room' });
      return;
    }

    if (room) {
      room.lastActivity = new Date();
    }

    this.server.to(roomId).emit('roomMessage', {
      roomId,
      message,
      timestamp: new Date().toISOString(),
      fromClient: client.id,
    });

    this.logger.debug(
      { socketId: client.id, roomId, messageLength: message?.length ?? 0 },
      'Room message broadcast',
    );

    return {
      success: true,
      message: `Message sent to room ${roomId}`,
    };
  }

  @SubscribeMessage('listRooms')
  handleListRooms(@ConnectedSocket() client: Socket) {
    const roomList = Array.from(this.rooms.entries()).map(([roomId, room]) => ({
      roomId,
      clientCount: room.clients.size,
      lastActivity: room.lastActivity,
      createdAt: room.createdAt,
    }));
    return {
      success: true,
      roomList,
    };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    this.leaveRoom(client, roomId);
  }

  private leaveRoom(client: Socket, roomId: string): void {
    if (client.rooms.has(roomId)) {
      client.leave(roomId);
    }

    const room = this.rooms.get(roomId);

    if (room) {
      room.clients.delete(client.id);

      if (room.clients.size === 0) {
        this.rooms.delete(roomId);
      } else {
        room.lastActivity = new Date();
      }
    }
    client.emit('leaveRoom', {
      roomId,
    });
    this.logger.info({ socketId: client.id, roomId }, 'Client left room');
  }
}
