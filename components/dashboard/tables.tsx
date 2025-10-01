"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecentActivity {
  leads: Array<{
    id: string
    name: string
    phone: string
    status: string
    lastActivity: string
    lastActivityType: string
  }>
  calls: Array<{
    id: string
    leadName: string
    startedAt: string
    duration: number
    status: string
    transcript: string
  }>
  orders: Array<{
    id: string
    orderNo: string
    leadName: string
    amount: number
    status: string
    createdAt: string
  }>
}

export function DashboardTables() {
  const [data, setData] = useState<RecentActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        // Fetch recent leads
        const leadsRes = await fetch('/api/leads?limit=5')
        const leadsData = await leadsRes.json()

        // Fetch recent calls
        const callsRes = await fetch('/api/calls?limit=5')
        const callsData = await callsRes.json()

        // Fetch recent orders
        const ordersRes = await fetch('/api/orders?limit=5')
        const ordersData = await ordersRes.json()

        setData({
          leads: leadsData.leads,
          calls: callsData.calls,
          orders: ordersData.orders
        })
      } catch (error) {
        console.error('Error fetching recent activity:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] bg-muted/10" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>Latest lead activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      lead.status === 'NEW' ? 'default' :
                      lead.status === 'CONTACTED' ? 'secondary' :
                      lead.status === 'QUALIFIED' ? 'info' :
                      lead.status === 'CLOSED' ? 'success' :
                      'destructive'
                    }>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(lead.lastActivity), 'MMM d, h:mm a')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>Latest call activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.calls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell className="font-medium">{call.leadName}</TableCell>
                  <TableCell>
                    {Math.round(call.duration / 60)}min
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      call.status === 'COMPLETED' ? 'success' :
                      call.status === 'FAILED' ? 'destructive' :
                      'secondary'
                    }>
                      {call.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest order activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNo}</TableCell>
                  <TableCell>
                    RM {order.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === 'PAID' ? 'success' :
                      order.status === 'PENDING' ? 'warning' :
                      order.status === 'CANCELLED' ? 'destructive' :
                      'secondary'
                    }>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
