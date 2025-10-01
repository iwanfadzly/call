import { prisma } from '../../lib/db'
import { logger } from '../utils/logger'
import { addExportJob } from './queue'
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'

// Get revenue statistics
export async function getRevenueStats(
  startDate?: Date,
  endDate?: Date,
  groupBy: 'daily' | 'monthly' = 'daily'
) {
  try {
    const where = {
      status: 'PAID',
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (groupBy === 'daily') {
      const dailyRevenue = await prisma.order.groupBy({
        by: ['createdAt'],
        where,
        _sum: {
          totalAmount: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      return {
        daily: dailyRevenue.map(day => ({
          date: format(day.createdAt, 'yyyy-MM-dd'),
          amount: day._sum.totalAmount || 0
        }))
      }
    } else {
      const monthlyRevenue = await prisma.order.groupBy({
        by: ['createdAt'],
        where,
        _sum: {
          totalAmount: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      return {
        monthly: monthlyRevenue.map(month => ({
          month: format(month.createdAt, 'yyyy-MM'),
          amount: month._sum.totalAmount || 0
        }))
      }
    }
  } catch (error) {
    logger.error('Error getting revenue stats:', error)
    throw error
  }
}

// Get call statistics
export async function getCallStats(
  startDate?: Date,
  endDate?: Date,
  groupBy: 'daily' | 'monthly' = 'daily'
) {
  try {
    const where = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (groupBy === 'daily') {
      const dailyCalls = await prisma.callLog.groupBy({
        by: ['startedAt', 'status'],
        where,
        _count: true,
        orderBy: {
          startedAt: 'asc'
        }
      })

      return {
        daily: Object.entries(
          dailyCalls.reduce((acc, curr) => {
            const date = format(curr.startedAt, 'yyyy-MM-dd')
            if (!acc[date]) {
              acc[date] = { total: 0, success: 0 }
            }
            acc[date].total += curr._count
            if (curr.status === 'COMPLETED') {
              acc[date].success += curr._count
            }
            return acc
          }, {} as Record<string, { total: number; success: number }>)
        ).map(([date, stats]) => ({
          date,
          ...stats
        }))
      }
    } else {
      const monthlyCalls = await prisma.callLog.groupBy({
        by: ['startedAt', 'status'],
        where,
        _count: true,
        orderBy: {
          startedAt: 'asc'
        }
      })

      return {
        monthly: Object.entries(
          monthlyCalls.reduce((acc, curr) => {
            const month = format(curr.startedAt, 'yyyy-MM')
            if (!acc[month]) {
              acc[month] = { total: 0, success: 0 }
            }
            acc[month].total += curr._count
            if (curr.status === 'COMPLETED') {
              acc[month].success += curr._count
            }
            return acc
          }, {} as Record<string, { total: number; success: number }>)
        ).map(([month, stats]) => ({
          month,
          ...stats
        }))
      }
    }
  } catch (error) {
    logger.error('Error getting call stats:', error)
    throw error
  }
}

// Get conversion statistics
export async function getConversionStats(
  startDate?: Date,
  endDate?: Date,
  groupBy: 'daily' | 'monthly' = 'daily'
) {
  try {
    const where = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (groupBy === 'daily') {
      const dailyLeads = await prisma.lead.groupBy({
        by: ['createdAt', 'status'],
        where,
        _count: true,
        orderBy: {
          createdAt: 'asc'
        }
      })

      return {
        daily: Object.entries(
          dailyLeads.reduce((acc, curr) => {
            const date = format(curr.createdAt, 'yyyy-MM-dd')
            if (!acc[date]) {
              acc[date] = { leads: 0, converted: 0, rate: 0 }
            }
            acc[date].leads += curr._count
            if (curr.status === 'CLOSED') {
              acc[date].converted += curr._count
            }
            acc[date].rate = Math.round((acc[date].converted / acc[date].leads) * 100)
            return acc
          }, {} as Record<string, { leads: number; converted: number; rate: number }>)
        ).map(([date, stats]) => ({
          date,
          ...stats
        }))
      }
    } else {
      const monthlyLeads = await prisma.lead.groupBy({
        by: ['createdAt', 'status'],
        where,
        _count: true,
        orderBy: {
          createdAt: 'asc'
        }
      })

      return {
        monthly: Object.entries(
          monthlyLeads.reduce((acc, curr) => {
            const month = format(curr.createdAt, 'yyyy-MM')
            if (!acc[month]) {
              acc[month] = { leads: 0, converted: 0, rate: 0 }
            }
            acc[month].leads += curr._count
            if (curr.status === 'CLOSED') {
              acc[month].converted += curr._count
            }
            acc[month].rate = Math.round((acc[month].converted / acc[month].leads) * 100)
            return acc
          }, {} as Record<string, { leads: number; converted: number; rate: number }>)
        ).map(([month, stats]) => ({
          month,
          ...stats
        }))
      }
    }
  } catch (error) {
    logger.error('Error getting conversion stats:', error)
    throw error
  }
}

// Get agent performance statistics
export async function getAgentStats(
  agentId?: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const where = {
      agentId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    const [calls, orders, revenue] = await Promise.all([
      // Get call statistics
      prisma.callLog.aggregate({
        where,
        _count: true,
        _avg: {
          durationSec: true
        }
      }),

      // Get order statistics
      prisma.order.count({
        where: {
          lead: {
            callLogs: {
              some: {
                agentId,
                createdAt: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          },
          status: 'PAID'
        }
      }),

      // Get revenue statistics
      prisma.order.aggregate({
        where: {
          lead: {
            callLogs: {
              some: {
                agentId,
                createdAt: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          },
          status: 'PAID'
        },
        _sum: {
          totalAmount: true
        }
      })
    ])

    return {
      calls: {
        total: calls._count,
        avgDuration: calls._avg.durationSec || 0
      },
      orders,
      revenue: revenue._sum.totalAmount || 0
    }
  } catch (error) {
    logger.error('Error getting agent stats:', error)
    throw error
  }
}

// Get WhatsApp statistics
export async function getWhatsAppStats(
  startDate?: Date,
  endDate?: Date
) {
  try {
    const where = {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    }

    const [outbound, inbound, delivered] = await Promise.all([
      // Get outbound message count
      prisma.whatsAppLog.count({
        where: {
          ...where,
          direction: 'OUTBOUND'
        }
      }),

      // Get inbound message count
      prisma.whatsAppLog.count({
        where: {
          ...where,
          direction: 'INBOUND'
        }
      }),

      // Get delivered message count
      prisma.whatsAppLog.count({
        where: {
          ...where,
          status: 'DELIVERED'
        }
      })
    ])

    return {
      outbound,
      inbound,
      delivered,
      deliveryRate: outbound > 0 ? Math.round((delivered / outbound) * 100) : 0
    }
  } catch (error) {
    logger.error('Error getting WhatsApp stats:', error)
    throw error
  }
}

// Export data
export async function exportData(
  type: 'LEADS' | 'CALLS' | 'ORDERS',
  filters: any,
  userId: string
) {
  try {
    return await addExportJob(type, filters, userId)
  } catch (error) {
    logger.error('Error starting export job:', error)
    throw error
  }
}

export default {
  getRevenueStats,
  getCallStats,
  getConversionStats,
  getAgentStats,
  getWhatsAppStats,
  exportData
}
