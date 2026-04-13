import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password === process.env.ADMIN_SECRET) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', process.env.ADMIN_SECRET!, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  }

  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}