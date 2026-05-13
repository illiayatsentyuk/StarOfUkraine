---
name: frontend-sockets
description: >-
  Expert for Socket.IO client usage in the StarOfUkraine Nuxt 4 frontend.
  Knows the socket.io-client setup, cookie-based auth (withCredentials), room
  joining, event handling patterns, and the ws-test playground page. Use when
  adding real-time features to pages or composables, listening to socket events
  (taskSubmitted, submissionEvaluated), managing socket lifecycle in Vue components,
  or debugging frontend socket connectivity.
---

# Frontend Sockets

## Stack

- **Library**: `socket.io-client` ^4.8.3 (direct import, no wrapper)
- **Nuxt module**: `@alexcolls/nuxt-socket.io` is installed but not used — connect manually with `io()`.
- **Auth**: cookie-based (`access_token` HttpOnly cookie set by the backend on sign-in). Pass `withCredentials: true` on connect.

`socket.io-client` is pre-optimised in Vite (`nuxt.config.ts` → `optimizeDeps.include`).

## Connecting

```ts
import { io, type Socket } from 'socket.io-client'

const socket = io('http://localhost:3001', { withCredentials: true })
```

- **Port 3001** is the socket-service (not the backend on 3000).
- `withCredentials: true` sends the `access_token` cookie on the WebSocket handshake. Without it the server rejects the connection.
- The user must be signed in (cookie present) before connecting.

## Lifecycle in a Vue component

```ts
let socket: Socket | null = null

onMounted(() => {
  socket = io(SOCKET_URL, { withCredentials: true })

  socket.on('connect', () => { /* ... */ })
  socket.on('connect_error', (err) => { /* ... */ })
  socket.on('disconnect', (reason) => { /* ... */ })
})

onBeforeUnmount(() => {
  socket?.disconnect()
  socket = null
})
```

Always disconnect in `onBeforeUnmount` to avoid ghost listeners on route change.

## Joining a tournament room

After connecting, join the room to receive tournament-scoped events:

```ts
socket.emit('joinRoom', { roomId: `tournament:${tournamentId}` })
```

The server puts the client in room `tournament:<id>` and echoes `joinRoom` back to all room members.

To leave:
```ts
socket.emit('leaveRoom', { roomId: `tournament:${tournamentId}` })
```

## Listening to server-pushed events

| Event | Payload | When |
|-------|---------|------|
| `taskSubmitted` | `{ tournamentId, taskId, teamId, submissionId }` | A team submits a task |
| `submissionEvaluated` | `{ tournamentId, submissionId, taskId, juryId, totalScore, finalised }` | A jury scores a submission |
| `joinRoom` | `{ roomId, clientId }` | Someone joined the room |
| `leaveRoom` | `{ roomId }` | You left a room |
| `broadcast` | `{ message, timestamp, fromClient }` | Global broadcast |
| `message` | `{ originalMsg, timestamp }` | Echo of your own message |
| `roomMessage` | `{ roomId, message, timestamp, fromClient }` | Message in a room |

```ts
socket.on('taskSubmitted', (payload) => {
  // update scoreboard / show toast
})

socket.on('submissionEvaluated', (payload) => {
  // update score display
})
```

## Emitting client events

| Emit | Payload | Purpose |
|------|---------|---------|
| `joinRoom` | `{ roomId: string }` | Join a room |
| `leaveRoom` | `{ roomId: string }` | Leave a room |
| `message` | `{ message: string }` | Echo test |
| `broadcast` | `{ message: string }` | Send to all clients |
| `roomMessage` | `{ roomId: string; message: string }` | Send to room members |

## Reference: test playground

`apps/frontend/app/pages/ws-test.vue` is a full working example covering:
- sign-in via `fetch('/auth/signin', { credentials: 'include' })`
- connect / disconnect
- joinRoom / leaveRoom
- message / broadcast / roomMessage
- event log display

Read this file when you need a real working pattern to copy from.

## Patterns to follow

**Reusable composable skeleton** (when promoting inline socket logic):
```ts
// composables/useTournamentSocket.ts
export function useTournamentSocket(tournamentId: Ref<string>) {
  const socket = shallowRef<Socket | null>(null)
  const connected = ref(false)

  function connect() {
    socket.value = io(useRuntimeConfig().public.socketUrl, { withCredentials: true })
    socket.value.on('connect', () => { connected.value = true })
    socket.value.on('disconnect', () => { connected.value = false })
    socket.value.emit('joinRoom', { roomId: `tournament:${tournamentId.value}` })
  }

  function disconnect() {
    socket.value?.disconnect()
    socket.value = null
    connected.value = false
  }

  onBeforeUnmount(disconnect)

  return { socket, connected, connect, disconnect }
}
```

Add `socketUrl` to `runtimeConfig.public` in `nuxt.config.ts` rather than hardcoding the URL.
