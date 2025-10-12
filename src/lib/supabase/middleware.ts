import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // ============================================
  // TENANT DETECTION
  // ============================================
  let tenantId: string | null = null

  // Prioridade 1: Usar TENANT_ID do .env (desenvolvimento)
  if (process.env.TENANT_ID) {
    tenantId = process.env.TENANT_ID
  } else {
    // Prioridade 2: Detectar por subdomain (produção)
    const hostname = request.headers.get('host') || ''
    const subdomain = hostname.split('.')[0]

    // Em produção, buscar tenant_id pelo subdomain
    // (vamos implementar depois)
  }

  // ============================================
  // SUPABASE SESSION
  // ============================================
  const supabaseResponse = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
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

  // ============================================
  // INJETAR TENANT_ID NO COOKIE
  // ============================================
  if (tenantId) {
    // Injetar tenant_id no cookie para uso no client-side
    supabaseResponse.cookies.set('x-tenant-id', tenantId, {
      path: '/',
      sameSite: 'lax',
    })
  }

  // ============================================
  // ROUTE PROTECTION
  // ============================================
  // Protected routes - require authentication
  const protectedPaths = ['/painel', '/dashboard']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    // Redirect to login if not authenticated
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Auth routes - redirect to dashboard if already logged in
  const authPaths = ['/login', '/cadastro']
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/painel'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
