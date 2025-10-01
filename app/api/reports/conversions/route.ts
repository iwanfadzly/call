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
      const leads = await prisma.lead.findMany({
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
      const dailyLeads = leads.reduce((acc, lead) => {
        const date = lead.createdAt.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = { leads: 0, converted: 0, rate: 0 }
        }
        acc[date].leads += 1
        if (lead.status === 'CLOSED') {
          acc[date].converted += 1
        }
        acc[date].rate = acc[date].leads > 0 
          ? Math.round((acc[date].converted / acc[date].leads) * 100) 
          : 0
        return acc
      }, {} as Record<string, { leads: number; converted: number; rate: number }>)

      const daily = Object.entries(dailyLeads).map(([date, stats]) => ({
        date,
        ...stats
      }))

      return NextResponse.json({ daily })
    } else {
      const leads = await prisma.lead.findMany({
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
      const monthlyLeads = leads.reduce((acc, lead) => {
        const month = lead.createdAt.toISOString().substring(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = { leads: 0, converted: 0, rate: 0 }
        }
        acc[month].leads += 1
        if (lead.status === 'CLOSED') {
          acc[month].converted += 1
        }
        acc[month].rate = acc[month].leads > 0 
          ? Math.round((acc[month].converted / acc[month].leads) * 100) 
          : 0
        return acc
      }, {} as Record<string, { leads: number; converted: number; rate: number }>)

      const monthly = Object.entries(monthlyLeads).map(([month, stats]) => ({
        month,
        ...stats
      }))

      return NextResponse.json({ monthly })
    }
  } catch (error) {
    console.error('Error fetching conversion data:', error)
    return NextResponse.json(
      { error: "Failed to fetch conversion data" },
      { status: 500 }
    )
  }
}
