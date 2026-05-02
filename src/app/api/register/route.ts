import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/actions/auth'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await registerUser(data)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
