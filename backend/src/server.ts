import express from "express"
import cors from "cors"
import { createServer } from "http"
import dotenv from "dotenv"

import connectDB from "./config/db"
import { initSocket } from "./config/socket"
import assignmentRoutes from "./routes/assignmentRoutes"
import { startAssignmentWorker } from "./workers/assignmentWorker"

dotenv.config()

const app = express()
const server = createServer(app)

void connectDB()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
)
app.use(express.json())

app.use("/api/assignments", assignmentRoutes)

app.get("/", (_req: any, res: any) => {
  res.send("VedaAI Backend Running")
})

const PORT = Number(process.env.PORT || 5000)

initSocket(server)
void startAssignmentWorker()

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})