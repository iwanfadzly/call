import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { MainNav } from '@/components/layout/main-nav'
import { UserNav } from '@/components/layout/user-nav'
import { SideNav } from '@/components/layout/side-nav'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav
              user={{
                name: session.user?.name,
                email: session.user?.email,
                image: session.user?.image,
              }}
            />
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <SideNav className="p-4" />
        </aside>
        <main className="flex w-full flex-col overflow-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
