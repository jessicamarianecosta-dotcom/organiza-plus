import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('redirect', {
    status: 302,
    headers: { Location: '/' }
  })
}
