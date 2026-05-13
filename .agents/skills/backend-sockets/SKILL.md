---
name: backend-sockets
description: >-
  Expert for the StarOfUkraine socket-service and backend↔socket communication.
  Knows the dual-transport setup (Redis microservice + Socket.IO), TournamentGateway,
  EventsController, WsJwtMiddleware, WsAuthGuard, and RedisIoAdapter. Use when
  adding new real-time events, wiring the backend to emit via ClientProxy, creating
  WebSocket guards/middleware, configuring the Redis adapter, or debugging socket
  connectivity issues.
---

# Backend Sockets

## Architecture

Two separate apps collaborate via **Redis**:

```
backend (port 3000)
  └─ TasksService → ClientProxy.emit('event.name', payload)
        └─ Redis (Transport.REDIS)
              └─ socket-service (port 3001)
                    ├─ EventsController   @MessagePattern  ← receives from Redis
                    └─ TournamentGateway  @WebSocketGateway ← pushes to Socket.IO clients
```

The socket-service also uses Redis as the **Socket.IO adapter** (`@socket.io/redis-adapter`) for horizontal scaling.

## Key files

| File | Role |
|------|------|
| `apps/socket-service/src/main.ts` | Bootstrap, Redis adapter wiring, microservice transport |
| `apps/socket-service/src/gateway/gateway.module.ts` | GatewayModule wires everything |
| `apps/socket-service/src/gateway/tournament.gateway.ts` | WebSocket gateway, room management, event emitters |
| `apps/socket-service/src/gateway/events.controller.ts` | Receives Redis messages, delegates to gateway |
| ~~`apps/socket-service/src/middleware/ws-jwt.middleware.ts`~~ | Removed — auth not required for sockets |
| ~~`apps/socket-service/src/guards/ws-auth.guard.ts`~~ | Removed — auth not required for sockets |
| `apps/socket-service/src/adapters/redis-io.adapter.ts` | `RedisIoAdapter` extends `IoAdapter` |
| `apps/socket-service/src/config/redis.config.ts` | `registerAs('redis', ...)` — `REDIS_URL` env var |
| `apps/backend/src/tasks/tasks.module.ts` | `SOCKET_SERVICE` token, `ClientsModule.registerAsync` |

## Adding a new real-time event

**1. Define the payload type** in `apps/socket-service/src/types/index.ts`:
```ts
export interface MyEventPayload {
  tournamentId: string;
  // ...fields
}
```

**2. Emit from the backend** (`TasksService` or whichever service):
```ts
this.socketClient.emit('my.event', payload);
```
`socketClient` is `ClientProxy` injected via `@Inject(SOCKET_SERVICE)`.

**3. Handle in `EventsController`**:
```ts
@MessagePattern('my.event')
handleMyEvent(@Payload() data: MyEventPayload): void {
  this.gateway.notifyMyEvent(data);
}
```

**4. Broadcast in `TournamentGateway`**:
```ts
notifyMyEvent(data: MyEventPayload): void {
  this.server.to(`tournament:${data.tournamentId}`).emit('myEvent', data);
}
```

Room name convention: **`tournament:<tournamentId>`**.

## Auth flow

`WsJwtMiddleware` runs as a socket.io server middleware (`afterInit`):
- Reads `access_token` from the handshake cookie header.
- Verifies with `JwtService.verifyAsync` using `process.env.JWT_SECRET`.
- Attaches `socket.data.user = { id, email, roles }`.
- Rejects with `'No auth token'` or `'Unauthorized'` on failure.

`WsAuthGuard` (applied globally on `TournamentGateway` via `@UseGuards`):
- Throws `WsException('Unauthorized')` if `socket.data.user` is missing.
- Supports `@WsRoles('admin')` decorator for role-based gating.

## Redis adapter

`RedisIoAdapter` (extends `IoAdapter`):
- Creates a pub/sub client pair from `REDIS_URL`.
- Awaits `ready` on both clients before starting.
- Injected into NestJS via `app.useWebSocketAdapter(redisAdapter)` in `main.ts`.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis for both microservice transport and Socket.IO adapter |
| `SOCKET_PORT` | `3001` | HTTP port for socket-service |
| `JWT_SECRET` | — | Must match the backend's secret |

## Existing WebSocket events (gateway → client)

| Event | Trigger | Room target |
|-------|---------|-------------|
| `taskSubmitted` | `task.submitted` Redis msg | `tournament:<id>` |
| `submissionEvaluated` | `submission.evaluated` Redis msg | `tournament:<id>` |
| `joinRoom` | client emits `joinRoom` | broadcasts to room |
| `leaveRoom` | client emits `leaveRoom` | emitted to sender only |
| `broadcast` | client emits `broadcast` | all connected clients |
| `message` | client emits `message` | emitted to sender only |
| `roomMessage` | client emits `roomMessage` | room members only |

## Common patterns

**Subscribe to a new client-sent event in the gateway:**
```ts
@SubscribeMessage('myClientEvent')
handleMyClientEvent(
  @MessageBody() data: { roomId: string },
  @ConnectedSocket() client: Socket,
) {
  // ...
}
```

**Role-gated event:**
```ts
@WsRoles('admin')
@SubscribeMessage('adminAction')
handleAdminAction(@ConnectedSocket() client: Socket) { /* ... */ }
```

`WsRoles` uses `SetMetadata('roles', roles)`. The guard reads via `reflector.getAllAndOverride` checking both handler and class, so `@WsRoles` works at either level with handler taking precedence.
