import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { RevenueReport } from "./components/revenue-report"
import { CallsReport } from "./components/calls-report"
import { ConversionReport } from "./components/conversion-report"
import { AgentPerformance } from "./components/agent-performance"
import { WhatsAppReport } from "./components/whatsapp-report"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Reports - SalesCallerAI",
  description: "Analytics and reporting dashboard",
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  if (!['ADMIN', 'MANAGER'].includes(role as string)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Track revenue trends and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Analytics</CardTitle>
              <CardDescription>
                Monitor call volumes and success rates
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <CallsReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Metrics</CardTitle>
              <CardDescription>
                Analyze lead conversion performance
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ConversionReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>
                Track individual agent metrics and rankings
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <AgentPerformance />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Analytics</CardTitle>
              <CardDescription>
                Monitor WhatsApp messaging performance
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <WhatsAppReport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
