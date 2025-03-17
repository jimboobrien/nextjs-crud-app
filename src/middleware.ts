import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Check if the request is for an API route
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  if (isApiRoute) {
    return response
  }

  // Handle authentication for protected routes
  if (request.nextUrl.pathname.startsWith('/todos')) {
    if (!session) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/todos', request.url))
  }

  return response
}

export const config = {
  matcher: ['/todos', '/login', '/register', '/api/todos/:path*'],
} 