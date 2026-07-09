import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/crypto'

function service() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUser() {
  const cookieStore = cookies() as any
  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await sb.auth.getUser()
  return user
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { code, phone_number_id, waba_id } = body as {
    code: string
    phone_number_id: string
    waba_id: string
  }

  if (!code || !phone_number_id || !waba_id) {
    return NextResponse.json(
      { error: 'Campos obrigatórios ausentes: code, phone_number_id, waba_id' },
      { status: 400 }
    )
  }

  const appId = process.env.NEXT_PUBLIC_META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: 'Aplicativo Meta não configurado no servidor' },
      { status: 500 }
    )
  }

  try {
    // 1. Exchange code for short-lived user access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${encodeURIComponent(code)}`
    )
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: `Falha na troca do código: ${tokenData.error?.message ?? 'Erro desconhecido'}` },
        { status: 400 }
      )
    }
    const shortToken = tokenData.access_token as string

    // 2. Exchange for long-lived token (~60 days)
    const llRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(shortToken)}`
    )
    const llData = await llRes.json()
    if (!llData.access_token) {
      return NextResponse.json(
        { error: `Falha ao obter token de longa duração: ${llData.error?.message ?? 'Erro desconhecido'}` },
        { status: 400 }
      )
    }
    const longToken = llData.access_token as string

    // 3. Get phone number display info
    const phoneRes = await fetch(
      `https://graph.facebook.com/v19.0/${phone_number_id}?fields=display_phone_number,verified_name`,
      { headers: { Authorization: `Bearer ${longToken}` } }
    )
    const phoneData = await phoneRes.json()
    const displayPhone = (phoneData.display_phone_number as string | undefined) ?? null
    const verifiedName = (phoneData.verified_name as string | undefined) ?? null

    // 4. Subscribe app to WABA for incoming webhooks
    await fetch(
      `https://graph.facebook.com/v19.0/${waba_id}/subscribed_apps`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${longToken}` },
      }
    )

    // 5. Encrypt credentials before storing
    if (!process.env.ENCRYPTION_KEY) {
      return NextResponse.json(
        { error: 'ENCRYPTION_KEY não configurada no servidor' },
        { status: 500 }
      )
    }
    const plainCredentials = JSON.stringify({ access_token: longToken, phone_number_id, waba_id })
    const encryptedCredentials = encrypt(plainCredentials)

    // 6. Upsert integration record
    const now = new Date().toISOString()
    const { error: dbError } = await service()
      .from('integrations')
      .upsert(
        {
          user_id: user.id,
          provider: 'whatsapp',
          provider_type: 'meta_embedded_signup',
          status: 'active',
          phone_number: displayPhone,
          provider_account_id: waba_id,
          connected_at: now,
          encrypted_credentials: encryptedCredentials,
          config_json: { verified_name: verifiedName, phone: displayPhone },
          updated_at: now,
        },
        { onConflict: 'user_id,provider' }
      )

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    return NextResponse.json({ ok: true, phone: displayPhone, verified_name: verifiedName })
  } catch (err) {
    console.error('[wa/callback]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
