import { io, type Socket } from 'socket.io-client'

export interface SubmissionEvaluatedPayload {
  tournamentId: string
  submissionId: string
  taskId: string
  juryId: string
  totalScore: number
  finalised: boolean
}

export interface TournamentSocketOptions {
  onSubmissionEvaluated?: (payload: SubmissionEvaluatedPayload) => void
}

export function useTournamentSocket(tournamentId: Ref<string>, options: TournamentSocketOptions = {}) {
  const config = useRuntimeConfig()
  const socket = shallowRef<Socket | null>(null)
  const connected = ref(false)

  function connect() {
    if (socket.value) return

    socket.value = io(config.public.socketUrl as string, { withCredentials: true })

    socket.value.on('connect', () => {
      connected.value = true
      socket.value!.emit('joinRoom', { roomId: `tournament:${tournamentId.value}` })
    })

    socket.value.on('disconnect', () => {
      connected.value = false
    })

    socket.value.on('connect_error', () => {
      connected.value = false
    })

    if (options.onSubmissionEvaluated) {
      socket.value.on('submissionEvaluated', options.onSubmissionEvaluated)
    }
  }

  function disconnect() {
    if (!socket.value) return
    socket.value.emit('leaveRoom', { roomId: `tournament:${tournamentId.value}` })
    socket.value.disconnect()
    socket.value = null
    connected.value = false
  }

  onMounted(connect)
  onBeforeUnmount(disconnect)

  return { socket, connected }
}
