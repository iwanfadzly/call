import { Queue, Worker } from "bullmq"
import IORedis from "ioredis"
import { logger } from "../utils/logger"
import config from "../config"

// Redis connection
const connection = new IORedis(config.redis.url, {
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
})

// Queue names
const QUEUE_NAMES = {
  CALLS: 'calls',
  WHATSAPP: 'whatsapp',
  EXPORTS: 'exports'
}

// Initialize queues
const queues = {
  calls: new Queue(QUEUE_NAMES.CALLS, { connection }),
  whatsapp: new Queue(QUEUE_NAMES.WHATSAPP, { connection }),
  exports: new Queue(QUEUE_NAMES.EXPORTS, { connection })
}

// Process calls queue
const callsWorker = new Worker(QUEUE_NAMES.CALLS, async (job) => {
  const { leadId, userId, callType } = job.data
  
  try {
    logger.info(`Processing call job for lead ${leadId}`)
    
    // Import calls service dynamically to avoid circular dependency
    const { makeCall } = await import('./calls')
    const result = await makeCall(leadId, userId, callType)
    
    logger.info(`Call job completed for lead ${leadId}`, { callId: result.id })
    return result
  } catch (error) {
    logger.error(`Call job failed for lead ${leadId}:`, error)
    throw error
  }
}, { connection })

// Process WhatsApp queue
const whatsappWorker = new Worker(QUEUE_NAMES.WHATSAPP, async (job) => {
  const { leadId, message, templateName, templateData } = job.data
  
  try {
    logger.info(`Processing WhatsApp job for lead ${leadId}`)
    
    // Mock WhatsApp sending for development
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    logger.info(`WhatsApp job completed for lead ${leadId}`)
    return { sent: true, messageId: `msg_${Date.now()}` }
  } catch (error) {
    logger.error(`WhatsApp job failed for lead ${leadId}:`, error)
    throw error
  }
}, { connection })

// Process exports queue
const exportsWorker = new Worker(QUEUE_NAMES.EXPORTS, async (job) => {
  const { type, filters, userId } = job.data
  
  try {
    logger.info(`Processing export job: ${type}`)
    
    // Mock export processing for development
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const exportUrl = `https://exports.example.com/${type}_${Date.now()}.csv`
    
    logger.info(`Export job completed: ${type}`, { exportUrl })
    return { exportUrl }
  } catch (error) {
    logger.error(`Export job failed: ${type}:`, error)
    throw error
  }
}, { connection })

// Worker event handlers
callsWorker.on('completed', (job) => {
  logger.info(`Call job ${job.id} completed`)
})

callsWorker.on('failed', (job, err) => {
  logger.error(`Call job ${job?.id} failed:`, err)
})

whatsappWorker.on('completed', (job) => {
  logger.info(`WhatsApp job ${job.id} completed`)
})

whatsappWorker.on('failed', (job, err) => {
  logger.error(`WhatsApp job ${job?.id} failed:`, err)
})

exportsWorker.on('completed', (job) => {
  logger.info(`Export job ${job.id} completed`)
})

exportsWorker.on('failed', (job, err) => {
  logger.error(`Export job ${job?.id} failed:`, err)
})

// Queue management functions
export async function addCallJob(leadId: string, userId: string, callType: string = 'SALES', delay: number = 0) {
  const job = await queues.calls.add('make-call', {
    leadId,
    userId,
    callType
  }, {
    delay,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  })

  logger.info(`Added call job ${job.id} for lead ${leadId}`)
  return job
}

export async function addWhatsAppJob(
  leadId: string, 
  message?: string, 
  templateName?: string, 
  templateData?: any,
  delay: number = 0
) {
  const job = await queues.whatsapp.add('send-message', {
    leadId,
    message,
    templateName,
    templateData
  }, {
    delay,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  })

  logger.info(`Added WhatsApp job ${job.id} for lead ${leadId}`)
  return job
}

export async function addExportJob(type: string, filters: any, userId: string) {
  const job = await queues.exports.add('export-data', {
    type,
    filters,
    userId
  }, {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
  })

  logger.info(`Added export job ${job.id} for type ${type}`)
  return job
}

// Get job status
export async function getJobStatus(queueName: string, jobId: string) {
  const queue = queues[queueName as keyof typeof queues]
  if (!queue) throw new Error(`Queue ${queueName} not found`)
  
  const job = await queue.getJob(jobId)
  if (!job) throw new Error(`Job ${jobId} not found`)
  
  return {
    id: job.id,
    name: job.name,
    data: job.data,
    progress: job.progress,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    opts: job.opts
  }
}

// Get queue stats
export async function getQueueStats(queueName: string) {
  const queue = queues[queueName as keyof typeof queues]
  if (!queue) throw new Error(`Queue ${queueName} not found`)
  
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed(),
    queue.getDelayed()
  ])
  
  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    delayed: delayed.length
  }
}

// Cleanup function
export async function cleanup() {
  logger.info('Shutting down queue workers...')
  
  await Promise.all([
    callsWorker.close(),
    whatsappWorker.close(),
    exportsWorker.close()
  ])
  
  await Promise.all([
    queues.calls.close(),
    queues.whatsapp.close(),
    queues.exports.close()
  ])
  
  await connection.quit()
  logger.info('Queue workers shut down successfully')
}

// Handle graceful shutdown
process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)

export default {
  addCallJob,
  addWhatsAppJob,
  addExportJob,
  getJobStatus,
  getQueueStats,
  cleanup
}
