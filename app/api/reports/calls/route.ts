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
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (groupBy === 'daily') {
      const calls = await prisma.callLog.findMany({
        where,
        select: {
          createdAt: true,
          status: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Group by date
      const dailyCalls = calls.reduce((acc, call) => {
        const date = call.createdAt.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { total: 0, success: 0 }
        }
        acc[date].total += 1
        if (call.status === 'COMPLETED') {
          acc[date].success += 1
        }
        return acc
      }, {} as Record<string, { total: number; success: number }>)

      const daily = Object.entries(dailyCalls).map(([date, stats]) => ({
        date,
        ...stats
      }))

      return NextResponse.json({ daily })
    } else {
      const calls = await prisma.callLog.findMany({
        where,
        select: {
          createdAt: true,
          status: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // Group by month
      const monthlyCalls = calls.reduce((acc, call) => {
        const month = call.createdAt.toISOString().substring(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = { total: 0, success: 0 }
        }
        acc[month].total += 1
        if (call.status === 'COMPLETED') {
          acc[month].success += 1
        }
        return acc
      }, {} as Record<string, { total: number; success: number }>)

      const monthly = Object.entries(monthlyCalls).map(([month, stats]) => ({
        month,
        ...stats
      }))

      return NextResponse.json({ monthly })
    }
  } catch (error) {
    console.error('Error fetching call data:', error)
    return NextResponse.json(
      { error: "Failed to fetch call data" },
      { status: 500 }
    )
  }
}
