import { getAccountPermission } from '@/lib/github/account'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'edge' // 'nodejs' is the default

export async function GET(request: NextRequest) {
    const data = await getAccountPermission()

    return NextResponse.json(
        {
            ...data,
        },
        {
            status: 200,
        },
    )
}
