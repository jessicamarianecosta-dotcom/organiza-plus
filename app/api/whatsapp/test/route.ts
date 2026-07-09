import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { sendWhatsApp } from '@/lib/whatsapp'

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

// POST — send a test message and update is_connected status
export async function POST(req: NextRequest) {
  const cookieStore = cookies() as any
  const authSb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await authSb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = buildServiceClient()
  const { data: settings } = await sb
    .from('whatsapp_settings')
    .select('phone_number_id, access_token')
    .eq('user_id', user.id)
    .single()

  if (!settings?.phone_number_id || !settings?.access_token) {
    return NextResponse.json({ ok: false, error: 'Configure o WhatsApp Business antes de testar.' })
  }

  const body = await req.json().catch(() => ({}))
  const testPhone = body.phone

  if (!testPhone) {
    return NextResponse.json({ ok: false, error: 'Informe o número de telefone para o teste.' })
  }

  const result = await sendWhatsApp(
    { phone_number_id: settings.phone_number_id, access_token: settings.access_token },
    testPhone,
    'booking_received',
    {
      client_name: 'Teste',
      appt_date: new Date().toLocaleDateString('pt-BR'),
      appt_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
  )

  // Update is_connected based on result
  await sb
    .from('whatsapp_settings')
    .update({ is_connected: result.sent, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  return NextResponse.json({ ok: result.sent, sent: result.sent, error: result.error || null, wa_link: result.wa_link })
}
