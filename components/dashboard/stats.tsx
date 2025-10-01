"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

interface StatsData {
  leads: {
    total: number
    new: number
    contacted: number
    converted: number
  }
  calls: {
    total: number
    avgDuration: number
    success: number
  }
  orders: {
    total: number
    revenue: number
    pending: number
  }
  whatsapp: {
    total: number
    delivered: number
    responses: number
  }
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch leads stats
        const leadsRes = await fetch('/api/leads/stats/overview')
        const leadsData = await leadsRes.json()

        // Fetch calls stats
        const callsRes = await fetch('/api/calls/stats/overview')
        const callsData = await callsRes.json()

        // Fetch orders stats
        const ordersRes = await fetch('/api/orders/stats/overview')
        const ordersData = await ordersRes.json()

        // Fetch WhatsApp stats
        const whatsappRes = await fetch('/api/whatsapp/stats')
        const whatsappData = await whatsappRes.json()

        setStats({
          leads: {
            total: leadsData.totalLeads,
            new: leadsData.byStatus.NEW || 0,
            contacted: leadsData.byStatus.CONTACTED || 0,
            converted: leadsData.byStatus.CLOSED || 0,
          },
          calls: {
            total: callsData.total,
            avgDuration: callsData.avgDuration,
            success: callsData.success,
          },
          orders: {
            total: ordersData.totalOrders,
            revenue: ordersData.byChannel.ONLINE?.amount || 0,
            pending: ordersData.byStatus.PENDING || 0,
          },
          whatsapp: {
            total: whatsappData.outbound,
            delivered: whatsappData.delivered,
            responses: whatsappData.inbound,
          },
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Icons.user className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.leads.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.leads.new} new, {stats.leads.converted} converted
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calls Made</CardTitle>
          <Icons.phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.calls.total}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round(stats.calls.avgDuration / 60)}min avg duration
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <Icons.billing className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            RM {stats.orders.revenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.orders.total} orders ({stats.orders.pending} pending)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">WhatsApp Messages</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.whatsapp.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.whatsapp.delivered} delivered, {stats.whatsapp.responses} responses
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
