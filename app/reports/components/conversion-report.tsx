"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

interface ConversionData {
  daily?: Array<{
    date: string
    leads: number
    converted: number
    rate: number
  }>
  monthly?: Array<{
    month: string
    leads: number
    converted: number
    rate: number
  }>
}

export function ConversionReport() {
  const [data, setData] = useState<ConversionData | null>(null)
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
          `/api/reports/conversions?` +
          `startDate=${dateRange.from.toISOString()}&` +
          `endDate=${dateRange.to.toISOString()}&` +
          `groupBy=${view}`
        )
        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error("Error fetching conversion data:", error)
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
  const totalLeads = currentData?.reduce((sum, item) => sum + item.leads, 0) || 0
  const totalConverted = currentData?.reduce((sum, item) => sum + item.converted, 0) || 0
  const overallRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0

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
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              For selected period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Converted Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConverted}</div>
            <p className="text-xs text-muted-foreground">
              Successfully closed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Rate Trend</CardTitle>
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
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Conversion Rate"]}
                  labelFormatter={(label) => 
                    format(new Date(label), view === "daily" ? "MMM d, yyyy" : "MMMM yyyy")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#f59e0b"
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
