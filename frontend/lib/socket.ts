import { io, type Socket } from "socket.io-client"

let socketInstance: Socket | null = null

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000", {
      autoConnect: false,
      transports: ["websocket"],
      withCredentials: true,
    })
  }

  return socketInstance
}

export function connectSocket() {
  const socket = getSocket()

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}