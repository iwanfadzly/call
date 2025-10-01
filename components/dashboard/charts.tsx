"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts"

interface ChartData {
  revenue: {
    daily: Array<{
      date: string
      amount: number
    }>
    monthly: Array<{
      month: string
      amount: number
    }>
  }
  calls: {
    daily: Array<{
      date: string
      total: number
      success: number
    }>
    monthly: Array<{
      month: string
      total: number
      success: number
    }>
  }
  conversions: {
    daily: Array<{
      date: string
      leads: number
      converted: number
      rate: number
    }>
    monthly: Array<{
      month: string
      leads: number
      converted: number
      rate: number
    }>
  }
}

export function DashboardCharts() {
  const [data, setData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("daily")

  useEffect(() => {
    async function fetchChartData() {
      try {
        // Fetch revenue data
        const revenueRes = await fetch('/api/reports/revenue')
        const revenueData = await revenueRes.json()

        // Fetch calls data
        const callsRes = await fetch('/api/reports/calls')
        const callsData = await callsRes.json()

        // Fetch conversion data
        const conversionRes = await fetch('/api/reports/conversions')
        const conversionData = await conversionRes.json()

        setData({
          revenue: revenueData,
          calls: callsData,
          conversions: conversionData
        })
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Tabs
          value={timeframe}
          onValueChange={setTimeframe}
          className="w-[200px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data.revenue[timeframe as keyof typeof data.revenue]}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={timeframe === "daily" ? "date" : "month"}
                  fontSize={12}
                />
                <YAxis
                  fontSize={12}
                  tickFormatter={(value) => `RM${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`RM${value}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.calls[timeframe as keyof typeof data.calls]}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={timeframe === "daily" ? "date" : "month"}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#64748b" name="Total Calls" />
                <Bar dataKey="success" fill="#22c55e" name="Successful" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={data.conversions[timeframe as keyof typeof data.conversions]}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={timeframe === "daily" ? "date" : "month"}
                  fontSize={12}
                />
                <YAxis
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Conversion Rate"]}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
