import { getAccountPermission } from '@/lib/github/account'
import { getRepository } from '@/lib/github/repository'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'edge' // 'nodejs' is the default

export async function GET(request: NextRequest) {
    const account = await getAccountPermission()
    const repositories = await getRepository()

    return NextResponse.json(
        {
            account,
            repositories
        },
        {
            status: 200,
        },
    )
}
