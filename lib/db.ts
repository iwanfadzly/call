import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper functions for database operations

export async function getLeadWithActivities(leadId: string) {
  return await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      callLogs: {
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: {
          agent: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            }
          },
          payments: true,
        }
      },
      waLogs: {
        orderBy: { timestamp: 'desc' },
        take: 20,
      }
    }
  })
}

export async function getOrderWithDetails(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      lead: true,
      items: {
        include: {
          product: true,
        }
      },
      payments: true,
      waLogs: {
        orderBy: { timestamp: 'desc' },
        take: 20,
      }
    }
  })
}

export async function getCallLogWithDetails(callId: string) {
  return await prisma.callLog.findUnique({
    where: { id: callId },
    include: {
      lead: true,
      agent: {
        select: {
          name: true,
          email: true,
          role: true,
        }
      }
    }
  })
}

export async function createLeadActivity(
  leadId: string,
  type: string,
  title: string,
  content: string,
  metadata?: Record<string, unknown>
) {
  return await prisma.leadActivity.create({
    data: {
      leadId,
      type,
      title,
      content,
      metadata,
    }
  })
}

export async function updateLeadStatus(
  leadId: string,
  status: string,
  note?: string
) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { status }
  })

  if (note) {
    await createLeadActivity(
      leadId,
      'STATUS_CHANGE',
      'Status Updated',
      note,
      { oldStatus: lead.status, newStatus: status }
    )
  }

  return lead
}

export async function getProductWithKnowledgeBase(productId: string) {
  return await prisma.product.findUnique({
    where: { id: productId },
    include: {
      knowledgeBase: {
        orderBy: { type: 'asc' }
      }
    }
  })
}

export async function searchKnowledgeBase(query: string) {
  return await prisma.knowledgeBase.findMany({
    where: {
      OR: [
        { question: { contains: query, mode: 'insensitive' } },
        { answer: { contains: query, mode: 'insensitive' } },
        { type: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      product: true
    }
  })
}

export async function getDashboardStats(userId?: string) {
  const where = userId ? { agentId: userId } : {}
  
  const [leads, calls, orders] = await Promise.all([
    prisma.lead.count(),
    prisma.callLog.count({ where }),
    prisma.order.count()
  ])

  const [newLeads, qualifiedLeads, closedLeads] = await Promise.all([
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.lead.count({ where: { status: 'QUALIFIED' } }),
    prisma.lead.count({ where: { status: 'CLOSED' } })
  ])

  const [totalRevenue, pendingOrders] = await Promise.all([
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { totalAmount: true }
    }),
    prisma.order.count({ where: { status: 'PENDING' } })
  ])

  return {
    leads: {
      total: leads,
      new: newLeads,
      qualified: qualifiedLeads,
      closed: closedLeads,
      conversionRate: (closedLeads / leads) * 100
    },
    calls: {
      total: calls
    },
    orders: {
      total: orders,
      pending: pendingOrders,
      revenue: totalRevenue._sum.totalAmount || 0
    }
  }
}

export async function getAgentPerformance(agentId: string, period: 'daily' | 'weekly' | 'monthly') {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'daily':
      startDate = new Date(now.setHours(0, 0, 0, 0))
      break
    case 'weekly':
      startDate = new Date(now.setDate(now.getDate() - 7))
      break
    case 'monthly':
      startDate = new Date(now.setMonth(now.getMonth() - 1))
      break
  }

  const [calls, orders, revenue] = await Promise.all([
    prisma.callLog.count({
      where: {
        agentId,
        startedAt: { gte: startDate }
      }
    }),
    prisma.order.count({
      where: {
        lead: {
          callLogs: {
            some: {
              agentId,
              startedAt: { gte: startDate }
            }
          }
        },
        status: 'PAID'
      }
    }),
    prisma.order.aggregate({
      where: {
        lead: {
          callLogs: {
            some: {
              agentId,
              startedAt: { gte: startDate }
            }
          }
        },
        status: 'PAID'
      },
      _sum: { totalAmount: true }
    })
  ])

  return {
    calls,
    orders,
    revenue: revenue._sum.totalAmount || 0
  }
}
