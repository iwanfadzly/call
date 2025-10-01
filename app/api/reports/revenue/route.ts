import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { subDays } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !['ADMIN', 'MANAGER'].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : subDays(new Date(), 30)
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : new Date()
    const groupBy = searchParams.get('groupBy') || 'daily'

    const where = {
      status: 'PAID' as const,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (groupBy === 'daily') {
      const orders = await prisma.order.findMany({
        where,
        select: {
          createdAt: true,
          totalAmount: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Group by date
      const dailyRevenue = orders.reduce((acc, order) => {
        const date = order.createdAt.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += order.totalAmount
        return acc
      }, {} as Record<string, number>)

      const daily = Object.entries(dailyRevenue).map(([date, amount]) => ({
        date,
        amount
      }))

      return NextResponse.json({ daily })
    } else {
      const orders = await prisma.order.findMany({
        where,
        select: {
          createdAt: true,
          totalAmount: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Group by month
      const monthlyRevenue = orders.reduce((acc, order) => {
        const month = order.createdAt.toISOString().substring(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = 0
        }
        acc[month] += order.totalAmount
        return acc
      }, {} as Record<string, number>)

      const monthly = Object.entries(monthlyRevenue).map(([month, amount]) => ({
        month,
        amount
      }))

      return NextResponse.json({ monthly })
    }
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    )
  }
}
