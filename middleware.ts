import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Public paths that don't require authentication
    if (path.startsWith('/auth') || path === '/') {
      return NextResponse.next()
    }

    // API routes that don't require authentication
    if (path.startsWith('/api/whatsapp/webhook') || 
        path.startsWith('/api/payments/webhook')) {
      return NextResponse.next()
    }

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Role-based access control
    const role = token.role as string

    // Admin only routes
    if (path.startsWith('/settings') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Manager+ routes
    if ((path.startsWith('/reports') || path.startsWith('/api/reports')) && 
        !['ADMIN', 'MANAGER'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Agent+ routes (everything else)
    if (role === 'VIEWER' && 
        (path.startsWith('/leads') || 
         path.startsWith('/calls') || 
         path.startsWith('/orders'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

// Protect these paths with authentication
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/leads/:path*',
    '/calls/:path*',
    '/orders/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/api/:path*'
  ]
}
