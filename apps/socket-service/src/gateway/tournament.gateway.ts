import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectPinoLogger, type PinoLogger } from 'pino-nestjs';
import type { Server, Socket } from 'socket.io';
import type {
  BroadcastPayload,
  MessagePayload,
  SubmissionEvaluatedPayload,
  TaskSubmittedPayload,
} from '../types/index';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4040',
    credentials: true,
  },
})
export class TournamentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    @InjectPinoLogger(TournamentGateway.name)
    private readonly logger: PinoLogger,
  ) {}

  afterInit() {
    this.logger.info('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.info({ socketId: client.id }, 'WebSocket client connected');
  }

  handleDisconnect(client: Socket) {
    this.logger.info({ socketId: client.id }, 'WebSocket client disconnected');
  }

  notifyTaskSubmitted(data: TaskSubmittedPayload): void {
    this.server
      .to(`tournament:${data.tournamentId}`)
      .emit('taskSubmitted', data);
    this.logger.debug(
      { tournamentId: data.tournamentId, taskId: data.taskId },
      'taskSubmitted event emitted',
    );
  }

  notifySubmissionEvaluated(data: SubmissionEvaluatedPayload): void {
    this.server
      .to(`tournament:${data.tournamentId}`)
      .emit('submissionEvaluated', data);
    this.logger.debug(
      {
        tournamentId: data.tournamentId,
        submissionId: data.submissionId,
        finalised: data.finalised,
      },
      'submissionEvaluated event emitted',
    );
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody()
    data: { roomId: string } = { roomId: '1' },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    client.join(roomId);

    this.server.to(roomId).emit('joinRoom', {
      roomId,
      clientId: client.id,
    });

    this.logger.info({ socketId: client.id, roomId }, 'Client joined room');
    return { success: true, message: `Joined room ${roomId}` };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    if (client.rooms.has(roomId)) {
      client.leave(roomId);
    }
    client.emit('leaveRoom', { roomId });
    this.logger.info({ socketId: client.id, roomId }, 'Client left room');
  }

  @SubscribeMessage('broadcast')
  handleBroadcast(
    @MessageBody() data: BroadcastPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    this.server.emit('broadcast', {
      message: `Broadcast to all: ${data?.message ?? 'No message'}`,
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

  @SubscribeMessage('roomMessage')
  handleRoomMessage(
    @MessageBody() data: { roomId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, message } = data;

    if (!client.rooms.has(roomId)) {
      client.emit('roomMessage', { error: 'You are not in this room' });
      return;
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

    return { success: true, message: `Message sent to room ${roomId}` };
  }

  @SubscribeMessage('listRooms')
  async handleListRooms(@ConnectedSocket() client: Socket) {
    const allRooms = await this.server.in(client.id).fetchSockets();
    const roomIds = Array.from(client.rooms).filter((r) => r !== client.id);
    return { success: true, rooms: roomIds, socketCount: allRooms.length };
  }
}
