import { NextRequest, NextResponse } from 'next/server'

// Error: Invariant: no match found for request.
// Pathname '/api/wasm' should have matched '/api/edge-geo'
export const config = {
    matcher: ['/api/wasm'],
}

export const middleware = (req: NextRequest) => {
    req.nextUrl.pathname = `/api/edge-geo`
    return NextResponse.rewrite(req.nextUrl)
}