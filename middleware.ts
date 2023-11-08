
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
    matcher: ['/api/wasm'],
}

// Error: Invariant: no match found for request.
// Pathname '/api/wasm' should have matched '/api/edge-geo'
// TODO: rewrite will error, but redirect can work
// export const middleware = (request: NextRequest) => {
//     return NextResponse.rewrite(new URL(`/api/edge-geo`, request.url)) 
// }

export const middleware = (request: NextRequest) => {
    return NextResponse.redirect(new URL(`/api/edge-geo`, request.url))
}
