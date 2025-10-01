"use client"

import { useState, useEffect } from "react"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2, Phone, DollarSign, Target } from "lucide-react"

interface AgentStats {
  id: string
  name: string
  email: string
  calls: {
    total: number
    avgDuration: number
  }
  orders: number
  revenue: number
}

export function AgentPerformance() {
  const [data, setData] = useState<AgentStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch all agents first
        const agentsResponse = await fetch('/api/users?role=AGENT')
        const agents = await agentsResponse.json()

        // Fetch stats for each agent
        const agentStats = await Promise.all(
          agents.map(async (agent: { id: string; name: string; email: string }) => {
            const statsResponse = await fetch(
              `/api/reports/agents/${agent.id}?` +
              `startDate=${dateRange.from.toISOString()}&` +
              `endDate=${dateRange.to.toISOString()}`
            )
            const stats = await statsResponse.json()
            return {
              ...agent,
              ...stats
            }
          })
        )

        setData(agentStats)
      } catch (error) {
        console.error("Error fetching agent performance data:", error)
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

  // Sort agents by revenue
  const sortedAgents = [...data].sort((a, b) => b.revenue - a.revenue)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Performers List */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedAgents.slice(0, 5).map((agent, index) => (
              <div key={agent.id} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/avatars/${agent.id}.jpg`} />
                    <AvatarFallback>
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{agent.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {agent.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    RM {agent.revenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {agent.calls.total} calls
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedAgents.slice(0, 10)}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <YAxis
                    tickFormatter={(value) => `RM${value}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`RM${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#0ea5e9"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedAgents.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`/avatars/${agent.id}.jpg`} />
                      <AvatarFallback>
                        {agent.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    RM {agent.revenue.toFixed(2)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{agent.calls.total}</p>
                      <p className="text-xs text-muted-foreground">Total Calls</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{agent.orders}</p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {Math.round(agent.calls.avgDuration / 60)}m
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Call</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
