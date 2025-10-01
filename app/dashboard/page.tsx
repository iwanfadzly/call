import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { DashboardStats } from "@/components/dashboard/stats"
import { DashboardCharts } from "@/components/dashboard/charts"
import { DashboardTables } from "@/components/dashboard/tables"

export const metadata: Metadata = {
  title: "Dashboard - SalesCallerAI",
  description: "Example dashboard app built using the components.",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <DashboardStats />
        {['ADMIN', 'MANAGER'].includes(role as string) && (
          <>
            <DashboardCharts />
            <DashboardTables />
          </>
        )}
      </div>
    </div>
  )
}
