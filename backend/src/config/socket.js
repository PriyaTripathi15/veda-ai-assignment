const { Server } = require("socket.io");

let ioInstance = null;

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    socket.on("assignment:join", ({ assignmentId }) => {
      if (assignmentId) {
        socket.join(String(assignmentId));
      }
    });

    socket.on("assignment:leave", ({ assignmentId }) => {
      if (assignmentId) {
        socket.leave(String(assignmentId));
      }
    });
  });

  return ioInstance;
}

function emitAssignmentUpdate(assignmentId, payload) {
  if (!ioInstance || !assignmentId) {
    return;
  }

  ioInstance.to(String(assignmentId)).emit("assignment:updated", {
    assignmentId: String(assignmentId),
    ...payload,
  });
}

module.exports = {
  initSocket,
  emitAssignmentUpdate,
};