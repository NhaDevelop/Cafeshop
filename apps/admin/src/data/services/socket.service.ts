import { io, type Socket } from 'socket.io-client'
import { storage } from '../../core/helpers/storage'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const config = useRuntimeConfig()
    socket = io(config.public.socketUrl, {
      auth:       { token: storage.getToken() },
      transports: ['websocket'],
      autoConnect: false,
    })
  }
  return socket
}

export const connectSocket    = () => getSocket().connect()
export const disconnectSocket = () => { socket?.disconnect(); socket = null }
