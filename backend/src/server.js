const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
require("dotenv").config();

const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const assignmentRoutes = require("./routes/assignmentRoutes");
const { startAssignmentWorker } = require("./workers/assignmentWorker");

const app = express();
const server = createServer(app);

connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://veda-ai-assignment-1-8wmn.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/assignments", assignmentRoutes);

app.get("/", (req, res) => {
  res.send("VedaAI Backend Running");
});

const PORT = process.env.PORT || 5000;

initSocket(server);
startAssignmentWorker();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});