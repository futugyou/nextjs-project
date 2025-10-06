import { getAccountPermission } from '@/github/account'
import { getRepository } from '@/github/repository'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'edge' // 'nodejs' is the default

export async function GET(request: NextRequest) {
    console.log(request.url)

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
