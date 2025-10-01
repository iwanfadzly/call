import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - SalesCallerAI',
  description: 'Authentication pages for SalesCallerAI',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      {children}
    </div>
  )
}
