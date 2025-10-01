"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2 } from "lucide-react"

interface CallData {
  daily?: Array<{
    date: string
    total: number
    success: number
  }>
  monthly?: Array<{
    month: string
    total: number
    success: number
  }>
}

export function CallsReport() {
  const [data, setData] = useState<CallData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [view, setView] = useState<"daily" | "monthly">("daily")

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/reports/calls?` +
          `startDate=${dateRange.from.toISOString()}&` +
          `endDate=${dateRange.to.toISOString()}&` +
          `groupBy=${view}`
        )
        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error("Error fetching call data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange, view])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) return null

  const currentData = view === "daily" ? data.daily : data.monthly
  const totalCalls = currentData?.reduce((sum, item) => sum + item.total, 0) || 0
  const successfulCalls = currentData?.reduce((sum, item) => sum + item.success, 0) || 0
  const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
        <Tabs value={view} onValueChange={(v) => setView(v as "daily" | "monthly")}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
            <p className="text-xs text-muted-foreground">
              For selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Successful Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successfulCalls}</div>
            <p className="text-xs text-muted-foreground">
              Completed with response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Call completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call Volume Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={view === "daily" ? "date" : "month"}
                  tickFormatter={(value) => 
                    format(new Date(value), view === "daily" ? "MMM d" : "MMM yyyy")
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) => 
                    format(new Date(label), view === "daily" ? "MMM d, yyyy" : "MMMM yyyy")
                  }
                />
                <Legend />
                <Bar
                  dataKey="total"
                  name="Total Calls"
                  fill="#64748b"
                  stackId="a"
                />
                <Bar
                  dataKey="success"
                  name="Successful"
                  fill="#22c55e"
                  stackId="b"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
