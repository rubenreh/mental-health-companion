import { NextResponse } from 'next/server'

export function middleware() {
  // Get the pathname of the request (e.g. /, /about, /dashboard)
  // const path = request.nextUrl.pathname

  // Define paths that are public (don't require authentication)
  // const isPublicPath = path === '/' || path === '/auth'

  // For now, let the client-side handle authentication
  // Firebase auth state is managed on the client side
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
