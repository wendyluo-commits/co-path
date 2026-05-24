import { NextRequest, NextResponse } from 'next/server';

const DEV_ONLY_ROUTES = ['/debug', '/test-api', '/test-images', '/test-pt', '/reset-quota'];

export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    const { pathname } = request.nextUrl;
    if (DEV_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
      return new NextResponse(null, { status: 404 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/debug/:path*',
    '/test-api/:path*',
    '/test-images/:path*',
    '/test-pt/:path*',
    '/reset-quota/:path*',
  ],
};
