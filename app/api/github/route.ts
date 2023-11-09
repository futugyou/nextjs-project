import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Octokit, App } from "octokit"

export const runtime = 'edge' // 'nodejs' is the default

export async function GET(request: NextRequest) {
    const octokit = new Octokit({ auth: `${process.env.GPT}` })
    const { data, headers, status, url } = await octokit.rest.users.getAuthenticated() 

    return NextResponse.json(
        {
            data,
            headers,
            status,
            url, 
        },
        {
            status: 200,
        },
    )
}