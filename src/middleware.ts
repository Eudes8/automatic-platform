
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Initialize Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const path = request.nextUrl.pathname;
    console.log(`[Middleware] Request to ${path}`);

    // 2. Check Auth Session
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.app_metadata?.role;
    const userEmail = user?.email;

    console.log(`[Middleware] Auth User: ${userEmail || 'NONE'} | Role: ${role || 'NONE'}`);

    // 3. Define Access Control Rules
    const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/admin');
    const isAdminPath = path.startsWith('/admin');
    const isAuthPage = path.startsWith('/login') || path.startsWith('/register');

    // 4. Handle Unauthenticated Access
    if (isProtectedPath && !user) {
        console.log(`[Middleware] Access Denied: Redirecting to login`);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 5. Handle Admin Access Control (RBAC)
    if (isAdminPath) {
        if (role !== 'ADMIN') {
            console.log(`[Middleware] Admin Access Denied for ${userEmail} (Role: ${role})`);
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // 6. Redirect authenticated users away from Login page
    if (isAuthPage && user) {
        if (role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api/ (API routes - generally we might want to protect them too but let's be careful not to block webhooks)
         * - public (public files)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
