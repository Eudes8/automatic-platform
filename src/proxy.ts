
import { NextResponse, type NextRequest } from 'next/server'

// Middleware allégé : logique publique uniquement.
// L'authentification est désormais gérée par Neon Auth (Better Auth) :
// - Les pages protégées (/dashboard, /admin) vérifient la session côté
//   serveur dans leurs layouts (src/app/*/layout.tsx) — défense en profondeur.
// - Les routes API vérifient la session via getAuthenticatedUser().
// - Le cycle auth passe par le proxy same-origin /api/auth/* (Neon Auth).
export function proxy(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Détection du pays pour initialiser la devise préférée (fix monnaie)
    const preferredCurrency = request.cookies.get('automatic_preferred_currency')?.value;
    if (!preferredCurrency) {
        const country = request.headers.get('x-vercel-ip-country') || 'FR';
        const initialCurrency = (country === 'CI' || country === 'SN') ? 'XOF' : 'EUR';
        response.cookies.set('automatic_preferred_currency', initialCurrency, {
            path: '/',
            maxAge: 60 * 60 * 24 * 365, // 1 year
        });
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
         * - api/ (API routes - protected individually via getAuthenticatedUser)
         * - public (public files)
         */
        '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
