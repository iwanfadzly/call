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

    return NextResponse.json({
      outbound,
      inbound,
      delivered,
      deliveryRate: outbound > 0 ? Math.round((delivered / outbound) * 100) : 0
    })
  } catch (error) {
    console.error('Error fetching WhatsApp data:', error)
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp data" },
      { status: 500 }
    )
  }
}
