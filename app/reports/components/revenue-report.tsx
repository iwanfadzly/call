"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

interface RevenueData {
  daily?: Array<{
    date: string
    amount: number
  }>
  monthly?: Array<{
    month: string
    amount: number
  }>
}

export function RevenueReport() {
  const [data, setData] = useState<RevenueData | null>(null)
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
          `/api/reports/revenue?` +
          `startDate=${dateRange.from.toISOString()}&` +
          `endDate=${dateRange.to.toISOString()}&` +
          `groupBy=${view}`
        )
        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error("Error fetching revenue data:", error)
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
  const totalRevenue = currentData?.reduce((sum, item) => sum + item.amount, 0) || 0
  const averageRevenue = totalRevenue / (currentData?.length || 1)

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
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              For selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {averageRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per {view === "daily" ? "day" : "month"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
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
                <YAxis
                  tickFormatter={(value) => `RM${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`RM${value.toFixed(2)}`, "Revenue"]}
                  labelFormatter={(label) => 
                    format(new Date(label), view === "daily" ? "MMM d, yyyy" : "MMMM yyyy")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
