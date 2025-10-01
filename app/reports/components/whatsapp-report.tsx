"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

interface WhatsAppData {
  outbound: number
  inbound: number
  delivered: number
  deliveryRate: number
}

const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b"]

export function WhatsAppReport() {
  const [data, setData] = useState<WhatsAppData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  })

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/reports/whatsapp?` +
          `startDate=${dateRange.from.toISOString()}&` +
          `endDate=${dateRange.to.toISOString()}`
        )
        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error("Error fetching WhatsApp data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!data) return null

  const pieData = [
    { name: "Outbound", value: data.outbound },
    { name: "Inbound", value: data.inbound },
    { name: "Delivered", value: data.delivered },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outbound Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.outbound}</div>
            <p className="text-xs text-muted-foreground">
              Sent to customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inbound Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.inbound}</div>
            <p className="text-xs text-muted-foreground">
              Received from customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Delivery Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.deliveryRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Outbound delivery success
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Message Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
