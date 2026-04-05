import { Injectable, Logger, UseGuards } from '@nestjs/common';
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
import { Server, Socket } from 'socket.io';
import { WsJwtMiddleware } from 'src/middleware';
import { WsAuthGuard } from '../common/guards';
import { RoomInfo } from '../common/types';

type BroadcastPayload = {
  message?: string;
};
    
type MessagePayload = {
  message?: string;
};

@UseGuards(WsAuthGuard)
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('ChatGateway');
  private rooms: Map<string, RoomInfo> = new Map();

  constructor(private readonly wsJwtMiddleware: WsJwtMiddleware) {}
  afterInit() {
    this.server.use(this.wsJwtMiddleware.apply());
    this.logger.log('Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    client.removeAllListeners();
    client.disconnect(true);
    this.logger.log(`Client disconnected: ${client.id}`);
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
    this.logger.log(
      `Received message from ${client.id}: ${JSON.stringify(data)}`,
    );

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

    this.logger.log(`Client ${client.id} joined room ${roomId}`);

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

    this.logger.log(
      `Client ${client.id} sent message to room ${roomId}: ${message}`,
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
    this.logger.log(`Client ${client.id} left room ${roomId}`);
  }
}
