import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import { logger, stream } from './utils/logger'
import { prisma } from '../lib/db'

// Import routes
import leadsRouter from './routes/leads'
import ordersRouter from './routes/orders'
import whatsappRouter from './routes/whatsapp'
import callsRouter from './routes/calls'
import reportsRouter from './routes/reports'
// import settingsRouter from './routes/settings'

// Create Express app
const app = express()
const server = http.createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.NEXTAUTH_URL,
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors({
  origin: process.env.NEXTAUTH_URL,
  credentials: true
}))
app.use(helmet())
app.use(morgan('combined', { stream }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/leads', leadsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/whatsapp', whatsappRouter)
app.use('/api/calls', callsRouter)
app.use('/api/reports', reportsRouter)
// app.use('/api/settings', settingsRouter)

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)

  // Join room for call monitoring
  socket.on('join-call', (callId: string) => {
    socket.join(`call:${callId}`)
    logger.info(`Socket ${socket.id} joined call room: ${callId}`)
  })

  // Leave call room
  socket.on('leave-call', (callId: string) => {
    socket.leave(`call:${callId}`)
    logger.info(`Socket ${socket.id} left call room: ${callId}`)
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`)
  })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err)
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
})

// Start server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...')
  
  // Close server
  server.close(() => {
    logger.info('HTTP server closed')
  })

  // Close Socket.IO connections
  io.close(() => {
    logger.info('Socket.IO server closed')
  })

  // Close database connection
  await prisma.$disconnect()
  logger.info('Database connection closed')

  process.exit(0)
})

// Export for testing
export { app, server, io }
