const { Queue } = require("bullmq");
const IORedis = require("ioredis");

let queueInstance = null;
let redisConnection = null;

function isQueueEnabled() {
  return Boolean(process.env.REDIS_URL);
}

function getRedisConnection() {
  if (!isQueueEnabled()) {
    return null;
  }

  if (!redisConnection) {
    redisConnection = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }

  return redisConnection;
}

function getAssignmentQueue() {
  if (!isQueueEnabled()) {
    return null;
  }

  if (!queueInstance) {
    queueInstance = new Queue("assignment-generation", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  }

  return queueInstance;
}

module.exports = {
  isQueueEnabled,
  getRedisConnection,
  getAssignmentQueue,
};