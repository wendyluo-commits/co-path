import { NextRequest, NextResponse } from 'next/server';

const DEV_ONLY_ROUTES = ['/debug', '/test-api', '/test-images', '/test-pt'];

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    const { pathname } = request.nextUrl;
    if (DEV_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.notFound();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/debug/:path*', '/test-api/:path*', '/test-images/:path*', '/test-pt/:path*'],
};
