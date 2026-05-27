const { Worker } = require("bullmq");
const { getRedisConnection, isQueueEnabled } = require("../queue/assignmentQueue");
const { processAssignment, failAssignment } = require("../services/assignmentProcessor");

let workerInstance = null;

function startAssignmentWorker() {
  if (!isQueueEnabled()) {
    return null;
  }

  if (workerInstance) {
    return workerInstance;
  }

  workerInstance = new Worker(
    "assignment-generation",
    async (job) => {
      await job.updateProgress(20);
      const result = await processAssignment(job.data.assignmentId);
      await job.updateProgress(100);
      return result;
    },
    {
      connection: getRedisConnection(),
      concurrency: 2,
    }
  );

  workerInstance.on("failed", async (job, error) => {
    if (job) {
      await failAssignment(job.data.assignmentId, error);
    }
  });

  workerInstance.on("error", (error) => {
    console.error("Assignment worker error:", error);
  });

  return workerInstance;
}

module.exports = {
  startAssignmentWorker,
};