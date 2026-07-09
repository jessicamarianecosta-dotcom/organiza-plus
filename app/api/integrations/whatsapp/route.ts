import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { sendWhatsAppMessage } from '@/services/messaging/whatsapp'

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

// GET — integration status for the authenticated professional
export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await service()
    .from('integrations')
    .select('status, config_json, phone_number, connected_at, updated_at')
    .eq('user_id', user.id)
    .eq('provider', 'whatsapp')
    .single()

  if (!data) return NextResponse.json({ connected: false, status: null })

  const cfg = data.config_json as Record<string, unknown> | null
  return NextResponse.json({
    connected: data.status === 'active',
    status: data.status as string,
    phone: data.phone_number ?? cfg?.phone ?? null,
    verified_name: cfg?.verified_name ?? null,
    connected_at: data.connected_at as string | null,
    updated_at: data.updated_at as string,
  })
}

// POST — actions: disconnect | test
export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body as { action: string; phone?: string }

  if (action === 'disconnect') {
    await service()
      .from('integrations')
      .update({
        status: 'inactive',
        encrypted_credentials: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('provider', 'whatsapp')
    return NextResponse.json({ ok: true, connected: false })
  }

  if (action === 'test') {
    const { data: profile } = await service()
      .from('profiles')
      .select('whatsapp')
      .eq('id', user.id)
      .single()

    const testPhone = body.phone || profile?.whatsapp
    if (!testPhone) {
      return NextResponse.json({
        ok: false,
        error: 'Nenhum número disponível. Adicione seu WhatsApp no perfil antes de testar.',
      })
    }

    const result = await sendWhatsAppMessage(user.id, testPhone, 'booking_received', {
      client_name: 'Teste',
      appt_date: new Date().toLocaleDateString('pt-BR'),
      appt_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    })

    return NextResponse.json({
      ok: result.sent,
      sent: result.sent,
      error: result.error ?? null,
      wa_link: result.fallback_link,
    })
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}
