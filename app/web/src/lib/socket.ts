import { io, Socket } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL

let socket: Socket | null = null

// One shared /rt socket for the whole app. Created lazily so we only
// open a connection once a signed-in page actually needs live data.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${API_URL}/rt`, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    })
  }
  return socket
}

export function closeSocket() {
  socket?.disconnect()
  socket = null
}
