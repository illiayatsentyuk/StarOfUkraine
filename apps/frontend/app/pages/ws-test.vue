<template lang="pug">
  div.ws-test
    h1 WS Test (Auth + Socket.IO)

    section
      h2 Backend URL
      input(
        v-model="backendUrl"
        type="text"
        style="width: 520px"
        placeholder="http://localhost:3000"
      )

    section
      h2 Sign in (sets HttpOnly cookies)
      div
        label Email
      input(type="email" v-model="email" placeholder="user@example.com")

      div
        label Password
      input(type="password" v-model="password" placeholder="P@ssw0rd123")

      div
        button(@click="signIn") Sign in
      div.status(v-if="authStatus") {{ authStatus }}

    section
      h2 Socket
      div
        button(@click="connect" :disabled="connecting || socketConnected") Connect
        button(@click="disconnect" :disabled="connecting || !socketConnected") Disconnect
      div.status Status: {{ status }}
      div.status Socket id: {{ socketId || '-' }}

      div(style="height: 8px")

      h3 Test calls
      div
        input(v-model="roomId" type="text" style="width: 140px" placeholder="roomId")
        button(@click="joinRoom" :disabled="!socketConnected") joinRoom

      div(style="height: 8px")

      div
        input(v-model="messageText" type="text" style="width: 420px" placeholder="message")
      div
        button(@click="sendMessage" :disabled="!socketConnected") message
        button(@click="broadcast" :disabled="!socketConnected") broadcast

    section
      h2 Events log
      pre.log
        div(v-for="(line, idx) in logs" :key="idx") {{ line }}

</template>

<script setup lang="ts">
import { io, type Socket } from 'socket.io-client'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const backendUrl = ref('http://localhost:3000')
const email = ref('')
const password = ref('')
const authStatus = ref('')

const connecting = ref(false)
const socketConnected = ref(false)
const socketId = ref<string | null>(null)
const status = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')

const roomId = ref('1')
const messageText = ref('hello')

const logs = ref<string[]>([])
let socket: Socket | null = null

function pushLog(line: string) {
  logs.value.unshift(`${new Date().toISOString()} ${line}`)
  if (logs.value.length > 200) logs.value.pop()
}

async function signIn() {
  authStatus.value = ''
  try {
    const res = await fetch(`${backendUrl.value}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
    const data = await res.json()
    if (res.ok) {
      authStatus.value = 'Signed in'
      pushLog(`sign in OK: ${JSON.stringify(data)}`)
    } else {
      authStatus.value = `Error ${res.status}`
      pushLog(`sign in failed (${res.status}): ${JSON.stringify(data)}`)
    }
  } catch (err: any) {
    authStatus.value = 'Network error'
    pushLog(`sign in error: ${err?.message ?? String(err)}`)
  }
}

function connect() {
  if (connecting.value || socketConnected.value) return
  connecting.value = true
  status.value = 'connecting'

  try {
    socket = io(backendUrl.value, { withCredentials: true })

    socket.on('connect', () => {
      socketConnected.value = true
      socketId.value = socket!.id ?? null
      status.value = 'connected'
      pushLog(`connected: socket.id=${socket!.id}`)
    })

    socket.on('connect_error', (err: Error) => {
      socketConnected.value = false
      socketId.value = null
      status.value = 'error'
      pushLog(`connect_error: ${err.message}`)
    })

    socket.on('disconnect', (reason: string) => {
      socketConnected.value = false
      socketId.value = null
      status.value = 'disconnected'
      pushLog(`disconnected: ${reason}`)
    })

    socket.on('broadcast', (payload: unknown) => {
      pushLog(`event broadcast: ${JSON.stringify(payload)}`)
    })

    socket.on('message', (payload: unknown) => {
      pushLog(`event message: ${JSON.stringify(payload)}`)
    })

    socket.on('joinRoom', (payload: unknown) => {
      pushLog(`event joinRoom: ${JSON.stringify(payload)}`)
    })

    socket.on('roomMessage', (payload: unknown) => {
      pushLog(`event roomMessage: ${JSON.stringify(payload)}`)
    })

    socket.on('leaveRoom', (payload: unknown) => {
      pushLog(`event leaveRoom: ${JSON.stringify(payload)}`)
    })
  } catch (err: any) {
    status.value = 'error'
    pushLog(`connect failed: ${err?.message ?? String(err)}`)
  } finally {
    connecting.value = false
  }
}

function disconnect() {
  socket?.disconnect()
  socket = null
  socketConnected.value = false
  socketId.value = null
  status.value = 'disconnected'
  pushLog('socket disconnected (manual)')
}

function joinRoom() {
  socket?.emit('joinRoom', { roomId: roomId.value })
}

function sendMessage() {
  socket?.emit('message', { message: messageText.value })
}

function broadcast() {
  socket?.emit('broadcast', { message: messageText.value })
}

onMounted(() => {
  pushLog('page loaded; ready to sign in / connect')
})

onBeforeUnmount(() => {
  socket?.disconnect()
})
</script>

<style scoped>
.ws-test {
  padding: 16px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica,
    Arial, 'Apple Color Emoji', 'Segoe UI Emoji';
}

section {
  margin-bottom: 18px;
}

.status {
  margin-top: 8px;
}

.log {
  background: #0b1020;
  color: #d7e2ff;
  padding: 12px;
  border-radius: 8px;
  max-height: 300px;
  overflow: auto;
}

input,
button {
  margin-top: 6px;
}

button {
  margin-right: 10px;
}
</style>
