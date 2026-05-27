import { Queue } from "bullmq"
import IORedis from "ioredis"

let queueInstance: Queue | null = null
let redisConnection: IORedis | null = null

export function isQueueEnabled(): boolean {
  return Boolean(process.env.REDIS_URL)
}

export function getRedisConnection(): IORedis | null {
  if (!isQueueEnabled()) {
    return null
  }

  if (!redisConnection) {
    redisConnection = new IORedis(process.env.REDIS_URL as string, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    })
  }

  return redisConnection
}

export function getAssignmentQueue(): Queue | null {
  if (!isQueueEnabled()) {
    return null
  }

  if (!queueInstance) {
    queueInstance = new Queue("assignment-generation", {
      connection: getRedisConnection() as IORedis,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      },
    })
  }

  return queueInstance
}