import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Fonction pour vérifier le token JWT
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-secret-key-change-this');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = ['/login', '/api/health'];
  const isPublicPath = publicPaths.some(path => pathname === path);
  
  // Obtenir le token depuis les cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // Si c'est un chemin public, autoriser l'accès
  if (isPublicPath) {
    // Si l'utilisateur est déjà connecté et tente d'accéder à la page de login, le rediriger vers le tableau de bord
    if (pathname === '/login' && token) {
      try {
        const payload = await verifyToken(token);
        if (payload) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // Token invalide, continuer normalement
      }
    }
    
    return NextResponse.next();
  }
  
  // Pour les chemins protégés, vérifier l'authentification
  if (!token) {
    // Rediriger vers la page de login si aucun token n'est présent
    const loginUrl = new URL('/login', request.url);
    // Stocker l'URL de redirection dans un cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('redirect-url', pathname, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minutes
      path: '/',
      sameSite: 'strict',
    });
    return response;
  }
  
  // Vérifier la validité du token
  try {
    const payload = await verifyToken(token);
    if (!payload) {
      // Token invalide, rediriger vers la page de login
      const loginUrl = new URL('/login', request.url);
      // Stocker l'URL de redirection dans un cookie
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('redirect-url', pathname, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 5, // 5 minutes
        path: '/',
        sameSite: 'strict',
      });
      return response;
    }
    
    // Token valide, autoriser l'accès
    return NextResponse.next();
  } catch (error) {
    // Erreur lors de la vérification du token, rediriger vers la page de login
    const loginUrl = new URL('/login', request.url);
    // Stocker l'URL de redirection dans un cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('redirect-url', pathname, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minutes
      path: '/',
      sameSite: 'strict',
    });
    return response;
  }
}

// Configuration du middleware
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
};