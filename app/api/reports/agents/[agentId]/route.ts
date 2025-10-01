import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { startOfMonth, endOfMonth } from "date-fns"

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { agentId } = params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : startOfMonth(new Date())
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : endOfMonth(new Date())

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

    return NextResponse.json({
      calls: {
        total: calls._count,
        avgDuration: calls._avg.durationSec || 0
      },
      orders,
      revenue: revenue._sum.totalAmount || 0
    })
  } catch (error) {
    console.error('Error fetching agent stats:', error)
    return NextResponse.json(
      { error: "Failed to fetch agent statistics" },
      { status: 500 }
    )
  }
}
