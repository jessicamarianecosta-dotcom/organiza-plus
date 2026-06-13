import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { appointment_id, professional_phone, client_name, client_phone, appt_date, appt_time, professional_name } = body

    // Format WhatsApp message
    const msg = `✅ *Novo Agendamento — Organiza+*\n\n👤 *Paciente:* ${client_name}\n📱 *Telefone:* ${client_phone}\n📅 *Data:* ${appt_date}\n🕐 *Horário:* ${appt_time}\n\n_Acesse seu painel para confirmar._`

    // Try Evolution API (self-hosted) or Z-API
    const wppApiUrl = process.env.WHATSAPP_API_URL
    const wppToken = process.env.WHATSAPP_API_TOKEN
    const wppInstance = process.env.WHATSAPP_INSTANCE

    let sent = false

    if (wppApiUrl && wppToken && wppInstance) {
      // Evolution API
      const phone = professional_phone.replace(/\D/g, '')
      const res = await fetch(`${wppApiUrl}/message/sendText/${wppInstance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': wppToken },
        body: JSON.stringify({ number: `55${phone}@s.whatsapp.net`, text: msg }),
      })
      sent = res.ok
    }

    // Fallback: WhatsApp Web link (always works)
    const phone = professional_phone.replace(/\D/g, '')
    const waLink = `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`

    // Mark as notified in DB
    if (appointment_id) {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
      )
      await supabase.from('appointments').update({ notified_wpp: true }).eq('id', appointment_id)
    }

    return NextResponse.json({ success: true, sent, waLink })
  } catch (err) {
    console.error('WhatsApp error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
