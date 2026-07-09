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
    .select('status, config_json, updated_at')
    .eq('user_id', user.id)
    .eq('provider', 'whatsapp')
    .single()

  if (!data) return NextResponse.json({ connected: false, status: null })

  return NextResponse.json({
    connected: data.status === 'active',
    status: data.status as string,
    phone: (data.config_json as Record<string, unknown>)?.phone ?? null,
    updated_at: data.updated_at as string,
  })
}

// POST — actions: connect | disconnect | test
export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body as { action: string; phone?: string }

  if (action === 'connect' || action === 'reconnect') {
    const { data: profile } = await service()
      .from('profiles')
      .select('plan, plan_active, whatsapp')
      .eq('id', user.id)
      .single()

    if (profile?.plan !== 'premium' || !profile.plan_active) {
      return NextResponse.json({ error: 'Disponível apenas no Plano Pro', upgrade_required: true }, { status: 403 })
    }

    const { error } = await service()
      .from('integrations')
      .upsert({
        user_id: user.id,
        provider: 'whatsapp',
        provider_type: 'meta_cloud',
        status: 'active',
        config_json: { phone: profile?.whatsapp ?? null },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,provider' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, connected: true })
  }

  if (action === 'disconnect') {
    await service()
      .from('integrations')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
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

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
