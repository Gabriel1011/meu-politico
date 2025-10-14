import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let tenantId: string | null = null

  // Prioridade 1: Usar TENANT_ID do .env (desenvolvimento)
  const envTenantId = process.env.TENANT_ID
  if (envTenantId) {
    tenantId = envTenantId
  } else {
    // Prioridade 2: Detectar por subdomain (produção)
    // const hostname = request.headers.get('host') || ''
    // const subdomain = hostname.split('.')[0]

    // Em produção, buscar tenant_id pelo subdomain
    // TODO: Implementar lookup de tenant por subdomain
  }

  if (tenantId) {
    // Injetar tenant_id no cookie para uso no client-side
    supabaseResponse.cookies.set('x-tenant-id', tenantId, {
      path: '/',
      sameSite: 'lax',
    })
  }

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
