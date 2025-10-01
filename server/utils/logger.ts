import winston from 'winston'
import 'winston-daily-rotate-file'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
}

// Add colors to winston
winston.addColors(colors)

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
)

// Define file transport options
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/server-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.uncolorize(),
    winston.format.timestamp(),
    winston.format.json()
  )
})

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write logs to file
    fileRotateTransport
  ]
})

// Create a stream object for Morgan HTTP logging
export const stream = {
  write: (message: string) => {
    logger.http(message.trim())
  }
}

// Log unhandled rejections
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error)
})

// Log uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

// Helper functions for common logging patterns

export function logAPIRequest(
  method: string,
  path: string,
  params?: any,
  body?: any
) {
  logger.info(`API Request: ${method} ${path}`, {
    method,
    path,
    params,
    body
  })
}

export function logAPIResponse(
  method: string,
  path: string,
  statusCode: number,
  responseTime: number
) {
  logger.info(`API Response: ${method} ${path} ${statusCode} ${responseTime}ms`, {
    method,
    path,
    statusCode,
    responseTime
  })
}

export function logCallEvent(
  callId: string,
  event: string,
  data?: any
) {
  logger.info(`Call Event [${callId}]: ${event}`, {
    callId,
    event,
    data
  })
}

export function logWhatsAppEvent(
  messageId: string,
  event: string,
  data?: any
) {
  logger.info(`WhatsApp Event [${messageId}]: ${event}`, {
    messageId,
    event,
    data
  })
}

export function logPaymentEvent(
  orderId: string,
  event: string,
  data?: any
) {
  logger.info(`Payment Event [${orderId}]: ${event}`, {
    orderId,
    event,
    data
  })
}

export function logError(
  error: Error,
  context?: string,
  additionalData?: any
) {
  logger.error(`Error${context ? ` [${context}]` : ''}: ${error.message}`, {
    error: {
      message: error.message,
      stack: error.stack,
      ...additionalData
    }
  })
}

export function logWarning(
  message: string,
  context?: string,
  additionalData?: any
) {
  logger.warn(`Warning${context ? ` [${context}]` : ''}: ${message}`, additionalData)
}

export function logDebug(
  message: string,
  context?: string,
  data?: any
) {
  logger.debug(`Debug${context ? ` [${context}]` : ''}: ${message}`, data)
}

// Export default logger instance
export default logger
