import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Get the base domain from environment or default
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'mysite.com';

    // Extract subdomain
    let subdomain: string | null = null;

    // Production: username.mysite.com
    if (hostname.endsWith(`.${baseDomain}`)) {
        subdomain = hostname.replace(`.${baseDomain}`, '');
    }
    // Development: username.localhost:3000
    else if (hostname.includes('.localhost')) {
        subdomain = hostname.split('.')[0];
    }

    // Skip for main domain, www, api, and app routes
    const excludedSubdomains = ['www', 'api', 'app', 'admin'];
    if (!subdomain || excludedSubdomains.includes(subdomain)) {
        return NextResponse.next();
    }

    // Rewrite subdomain requests to /portfolio/[subdomain]
    // This allows username.mysite.com to show the portfolio
    if (url.pathname === '/' || url.pathname === '') {
        return NextResponse.rewrite(new URL(`/portfolio/${subdomain}`, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (files in public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    ],
};
