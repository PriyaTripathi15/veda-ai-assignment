import { Worker } from "bullmq"
import { getRedisConnection, isQueueEnabled } from "../queue/assignmentQueue"
import { failAssignment, processAssignment } from "../services/assignmentProcessor"

let workerInstance: Worker | null = null

export function startAssignmentWorker(): Worker | null {
  if (!isQueueEnabled()) {
    return null
  }

  if (workerInstance) {
    return workerInstance
  }

  workerInstance = new Worker(
    "assignment-generation",
    async (job) => {
      await job.updateProgress(20)
      const result = await processAssignment(job.data.assignmentId)
      await job.updateProgress(100)
      return result
    },
    {
      connection: getRedisConnection() as any,
      concurrency: 2,
    }
  )

  workerInstance.on("failed", async (job, error) => {
    if (job && error instanceof Error) {
      await failAssignment(job.data.assignmentId, error)
    }
  })

  workerInstance.on("error", (error) => {
    console.error("Assignment worker error:", error)
  })

  return workerInstance
}