import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/signup')
    const isProtectedAuthPage = req.nextUrl.pathname.startsWith('/auth/')

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Handle protected auth pages
    if (isProtectedAuthPage) {
      const { pathname, searchParams } = req.nextUrl

      // Allow setup-password only with required query parameters
      if (pathname.startsWith('/auth/setup-password')) {
        const hasRequiredParams = searchParams.has('email') && 
                                searchParams.has('provider') && 
                                searchParams.has('provider_account_id')
        if (!hasRequiredParams) {
          return NextResponse.redirect(new URL('/login', req.url))
        }
      }

      // Allow verify-request only when coming from auth flow
      if (pathname.startsWith('/auth/verify-request')) {
        const referer = req.headers.get('referer')
        if (!referer || !referer.includes('/login')) {
          return NextResponse.redirect(new URL('/login', req.url))
        }
      }

      // Allow callback only with proper auth parameters
      if (pathname.startsWith('/auth/callback')) {
        if (!searchParams.has('callbackUrl')) {
          return NextResponse.redirect(new URL('/login', req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true // Let the above middleware handle the redirect
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/auth/:path*']
} 