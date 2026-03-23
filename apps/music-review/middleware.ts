import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')

  if (authHeader?.toLowerCase().startsWith('basic ')) {
    try {
      const authValue = authHeader.slice(6)
      const [usr, ownPass] = atob(authValue).split(':')

      if (
        usr === process.env.BASIC_AUTH_USER &&
        ownPass === process.env.BASIC_AUTH_PASSWORD
      ) {
        return NextResponse.next()
      }
    } catch {
      // Invalid base64 — fall through to 401
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area", charset="UTF-8"',
    }
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ttf|woff|woff2)$).*)',
  ],
}

