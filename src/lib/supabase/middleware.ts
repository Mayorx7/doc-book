import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/') 
  ) {
    // no user, potentially redirect to login
    // BUT we have public pages, so we only protect specific routes
    if (request.nextUrl.pathname.startsWith('/patient') || request.nextUrl.pathname.startsWith('/doctor')) {
       const url = request.nextUrl.clone()
       url.pathname = '/auth'
       return NextResponse.redirect(url)
    }
  }

  // RBAC
  if (user) {
    // We need to check role. For this we usually need to read from the DB or custom claims.
    // For simplicity, we'll try to read the profile. 
    // WARNING: doing a DB call in middleware can be slow. 
    // Better strategy: custom claims (requires edge function on signup).
    // Alternative: Cookie based role (insecure if not signed, but supabase session is secure).
    
    // For this implementation, we will fetch the profile to check role for protection.
    // Note: This adds latency. A production app should use Claims.
    if (request.nextUrl.pathname.startsWith('/patient') || request.nextUrl.pathname.startsWith('/doctor')) {
        const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        
        const role = profile?.role;

        if (request.nextUrl.pathname.startsWith('/patient') && role !== 'patient') {
             return NextResponse.redirect(new URL('/doctor', request.url)) // or unauthorized
        }
        if (request.nextUrl.pathname.startsWith('/doctor') && role !== 'doctor') {
             return NextResponse.redirect(new URL('/patient', request.url))
        }
    }
  }

  return supabaseResponse
}
