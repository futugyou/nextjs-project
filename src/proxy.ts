import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPPORTED_LOCALES = ['zh', 'en']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/api/wasm') {
    return NextResponse.redirect(new URL(`/api/edge-geo`, request.url))
  }

  const pathnameLocale = SUPPORTED_LOCALES.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameLocale) {
    let targetPath = pathname.replace(new RegExp(`^/${pathnameLocale}`), '')

    if (!targetPath.startsWith('/')) {
      targetPath = '/' + targetPath
    }

    const url = request.nextUrl.clone()
    url.pathname = targetPath

    const response = NextResponse.rewrite(url)
    response.cookies.set('NEXT_LOCALE', pathnameLocale)

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/wasm', '/((?!api|_next|.*\\..*).*)'],
}
