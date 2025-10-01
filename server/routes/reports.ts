import express from 'express'
import { z } from 'zod'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { prisma } from '../../lib/db'
import { logger } from '../utils/logger'
import reports from '../services/reports'

const router = express.Router()

// Schema validation
const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['daily', 'monthly']).optional()
})

const exportSchema = z.object({
  type: z.enum(['LEADS', 'CALLS', 'ORDERS']),
  filters: z.record(z.any()).optional(),
  format: z.enum(['CSV', 'XLSX']).optional()
})

// Get revenue statistics
router.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = dateRangeSchema.parse(req.query)

    const stats = await reports.getRevenueStats(
      startDate ? new Date(startDate) : subDays(new Date(), 30),
      endDate ? new Date(endDate) : new Date(),
      groupBy as 'daily' | 'monthly'
    )

    res.json(stats)
  } catch (error) {
    logger.error('Error getting revenue stats:', error)
    res.status(400).json({ error: 'Failed to get revenue statistics' })
  }
})

// Get call statistics
router.get('/calls', async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = dateRangeSchema.parse(req.query)

    const stats = await reports.getCallStats(
      startDate ? new Date(startDate) : subDays(new Date(), 30),
      endDate ? new Date(endDate) : new Date(),
      groupBy as 'daily' | 'monthly'
    )

    res.json(stats)
  } catch (error) {
    logger.error('Error getting call stats:', error)
    res.status(400).json({ error: 'Failed to get call statistics' })
  }
})

// Get conversion statistics
router.get('/conversions', async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = dateRangeSchema.parse(req.query)

    const stats = await reports.getConversionStats(
      startDate ? new Date(startDate) : subDays(new Date(), 30),
      endDate ? new Date(endDate) : new Date(),
      groupBy as 'daily' | 'monthly'
    )

    res.json(stats)
  } catch (error) {
    logger.error('Error getting conversion stats:', error)
    res.status(400).json({ error: 'Failed to get conversion statistics' })
  }
})

// Get agent performance statistics
router.get('/agents/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params
    const { startDate, endDate } = dateRangeSchema.parse(req.query)

    const stats = await reports.getAgentStats(
      agentId,
      startDate ? new Date(startDate) : startOfMonth(new Date()),
      endDate ? new Date(endDate) : endOfMonth(new Date())
    )

    res.json(stats)
  } catch (error) {
    logger.error('Error getting agent stats:', error)
    res.status(400).json({ error: 'Failed to get agent statistics' })
  }
})

// Get WhatsApp statistics
router.get('/whatsapp', async (req, res) => {
  try {
    const { startDate, endDate } = dateRangeSchema.parse(req.query)

    const stats = await reports.getWhatsAppStats(
      startDate ? new Date(startDate) : subDays(new Date(), 30),
      endDate ? new Date(endDate) : new Date()
    )

    res.json(stats)
  } catch (error) {
    logger.error('Error getting WhatsApp stats:', error)
    res.status(400).json({ error: 'Failed to get WhatsApp statistics' })
  }
})

// Get overall dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date()
    const [
      dailyStats,
      monthlyStats,
      topAgents,
      recentActivity
    ] = await Promise.all([
      // Get today's statistics
      prisma.$transaction([
        prisma.lead.count({
          where: {
            createdAt: {
              gte: startOfDay(today),
              lte: endOfDay(today)
            }
          }
        }),
        prisma.callLog.count({
          where: {
            startedAt: {
              gte: startOfDay(today),
              lte: endOfDay(today)
            }
          }
        }),
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: startOfDay(today),
              lte: endOfDay(today)
            },
            status: 'PAID'
          },
          _sum: {
            totalAmount: true
          }
        })
      ]),

      // Get monthly statistics
      prisma.$transaction([
        prisma.lead.count({
          where: {
            createdAt: {
              gte: startOfMonth(today),
              lte: endOfMonth(today)
            }
          }
        }),
        prisma.callLog.count({
          where: {
            startedAt: {
              gte: startOfMonth(today),
              lte: endOfMonth(today)
            }
          }
        }),
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: startOfMonth(today),
              lte: endOfMonth(today)
            },
            status: 'PAID'
          },
          _sum: {
            totalAmount: true
          }
        })
      ]),

      // Get top performing agents
      prisma.user.findMany({
        where: {
          role: {
            in: ['AGENT', 'MANAGER']
          }
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              callLogs: {
                where: {
                  startedAt: {
                    gte: startOfMonth(today),
                    lte: endOfMonth(today)
                  }
                }
              }
            }
          }
        },
        orderBy: {
          callLogs: {
            _count: 'desc'
          }
        },
        take: 5
      }),

      // Get recent activity
      prisma.leadActivity.findMany({
        where: {
          createdAt: {
            gte: subDays(today, 7)
          }
        },
        include: {
          lead: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ])

    res.json({
      today: {
        leads: dailyStats[0],
        calls: dailyStats[1],
        revenue: dailyStats[2]._sum.totalAmount || 0
      },
      month: {
        leads: monthlyStats[0],
        calls: monthlyStats[1],
        revenue: monthlyStats[2]._sum.totalAmount || 0
      },
      topAgents,
      recentActivity
    })
  } catch (error) {
    logger.error('Error getting dashboard stats:', error)
    res.status(400).json({ error: 'Failed to get dashboard statistics' })
  }
})

// Export data
router.post('/export', async (req, res) => {
  try {
    const { type, filters, format } = exportSchema.parse(req.body)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const job = await reports.exportData(type, filters, userId)

    res.json({
      message: 'Export job created',
      jobId: job.id
    })
  } catch (error) {
    logger.error('Error creating export job:', error)
    res.status(400).json({ error: 'Failed to create export job' })
  }
})

// Get export job status
router.get('/export/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params

    const job = await prisma.queueJob.findUnique({
      where: { id: jobId }
    })

    if (!job) {
      return res.status(404).json({ error: 'Export job not found' })
    }

    res.json(job)
  } catch (error) {
    logger.error('Error getting export job status:', error)
    res.status(400).json({ error: 'Failed to get export job status' })
  }
})

export default router
