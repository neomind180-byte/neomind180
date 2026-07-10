import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Use getUser() instead of getSession() here.
  // getUser() validates the JWT with the Supabase Auth server and triggers
  // an automatic token refresh if the access token has expired but the
  // refresh token is still valid. This is the critical fix — without this,
  // expired JWTs cause all downstream API calls to fail or hang.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no valid session and trying to access protected routes, redirect to login
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('reason', 'session_expired')
    return NextResponse.redirect(url)
  }

  // Return the response with refreshed auth cookies attached
  return supabaseResponse
}

export const config = {
  matcher: [
    // Run on dashboard routes to refresh auth before page loads
    '/dashboard/:path*',
  ],
}
