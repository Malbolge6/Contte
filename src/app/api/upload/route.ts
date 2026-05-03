import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Admin client that bypasses RLS
const supabaseAdmin = createClient(
  'https://goncxqazlzxgoscvmojb.supabase.co',
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const groupId = formData.get('groupId') as string

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 10MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${session.user.id}/${groupId}/${Date.now()}_${safeName}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { data, error } = await supabaseAdmin.storage
      .from('comprovantes')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) throw new Error(error.message)

    const { data: urlData } = supabaseAdmin.storage
      .from('comprovantes')
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      name: file.name,
      type: ext,
      size: file.size,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
