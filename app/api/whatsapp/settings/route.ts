import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function buildAuthClient() {
  const cookieStore = cookies() as any
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

function buildServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUser() {
  const sb = buildAuthClient()
  const { data: { user } } = await sb.auth.getUser()
  return user
}

// GET — return settings for the authenticated professional (token masked)
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = buildServiceClient()
  const { data } = await sb
    .from('whatsapp_settings')
    .select('phone_number_id, business_account_id, verify_token, is_connected, updated_at')
    .eq('user_id', user.id)
    .single()

  if (!data) return NextResponse.json({ settings: null })

  // Also check if access_token is saved (masked — never returned to client)
  const { data: raw } = await sb
    .from('whatsapp_settings')
    .select('access_token')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    settings: {
      ...data,
      has_token: !!(raw?.access_token),
    }
  })
}

// POST — save settings
export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { phone_number_id, business_account_id, access_token, verify_token } = body

  if (!phone_number_id || !business_account_id || !access_token) {
    return NextResponse.json({ error: 'phone_number_id, business_account_id e access_token são obrigatórios' }, { status: 400 })
  }

  const sb = buildServiceClient()
  const payload: Record<string, unknown> = {
    user_id: user.id,
    phone_number_id: phone_number_id.trim(),
    business_account_id: business_account_id.trim(),
    access_token: access_token.trim(),
    verify_token: verify_token?.trim() || null,
    is_connected: false,
    updated_at: new Date().toISOString(),
  }

  const { error } = await sb
    .from('whatsapp_settings')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) {
    console.error('[wa/settings] upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE — remove settings
export async function DELETE() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = buildServiceClient()
  await sb.from('whatsapp_settings').delete().eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
