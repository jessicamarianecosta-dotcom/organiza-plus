import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 })
    }

    // Always store as JPEG with a cache-bust timestamp to force CDN refresh
    const ts   = Date.now()
    const path = `avatars/${user.id}_${ts}.jpg`

    const bytes = await file.arrayBuffer()

    const { error: upErr } = await supabase.storage
      .from('profiles')
      .upload(path, bytes, { contentType: 'image/jpeg', upsert: true })

    if (upErr) {
      console.error('[upload] Storage error:', upErr)
      return NextResponse.json({ error: `Erro no Storage: ${upErr.message}` }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path)

    const { error: dbErr } = await supabase
      .from('profiles')
      .update({ photo_url: publicUrl })
      .eq('id', user.id)

    if (dbErr) {
      console.error('[upload] DB update error:', dbErr)
      // Return the URL anyway — the photo was uploaded; the caller can retry saving
    }

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('[upload] Unexpected error:', err)
    return NextResponse.json({ error: `Erro inesperado: ${String(err)}` }, { status: 500 })
  }
}
