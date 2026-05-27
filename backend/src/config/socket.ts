import { Server } from "socket.io"
import type { Server as HttpServer } from "http"

let ioInstance: Server | null = null

export function initSocket(server: HttpServer): Server {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  ioInstance.on("connection", (socket) => {
    socket.on("assignment:join", ({ assignmentId }: { assignmentId?: string }) => {
      if (assignmentId) {
        socket.join(String(assignmentId))
      }
    })

    socket.on("assignment:leave", ({ assignmentId }: { assignmentId?: string }) => {
      if (assignmentId) {
        socket.leave(String(assignmentId))
      }
    })
  })

  return ioInstance
}

export function emitAssignmentUpdate(assignmentId: string, payload: Record<string, unknown>): void {
  if (!ioInstance || !assignmentId) {
    return
  }

  ioInstance.to(String(assignmentId)).emit("assignment:updated", {
    assignmentId: String(assignmentId),
    ...payload,
  })
}