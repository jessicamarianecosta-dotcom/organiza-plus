import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWhatsApp, buildWaMessage, WaMessageType, WaData } from '@/lib/whatsapp'

// Service-role client — bypasses RLS so we can look up settings for any professional
function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getWaSettings(professional_id: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  const { data } = await sb()
    .from('whatsapp_settings')
    .select('phone_number_id, access_token, is_connected')
    .eq('user_id', professional_id)
    .single()
  return data as { phone_number_id: string; access_token: string; is_connected: boolean } | null
}

async function logWa(entry: {
  appointment_id?: string | null
  professional_id?: string | null
  phone: string
  type: string
  message: string
  status: 'sent' | 'failed' | 'skipped'
  error?: string | null
  meta?: Record<string, unknown>
}) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return
  await sb().from('whatsapp_logs').insert({
    appointment_id: entry.appointment_id || null,
    professional_id: entry.professional_id || null,
    phone: entry.phone,
    type: entry.type,
    message: entry.message,
    status: entry.status,
    error: entry.error || null,
    meta: entry.meta || {},
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      type = 'new_booking',
      appointment_id,
      professional_id,
      professional_phone,
      professional_name,
      professional_specialty,
      client_phone,
      client_name,
      appt_date,
      appt_time,
      modality,
      price,
      meeting_link,
      clinic_name,
      address,
      maps_link,
      new_date,
      new_time,
    } = body

    const data: WaData = {
      client_name, client_phone, professional_name, professional_specialty,
      appt_date, appt_time, modality, price,
      meeting_link, clinic_name, address, maps_link,
      new_date, new_time,
    }

    // Determine target phone and recipient type
    const isClientMessage = ['confirmed','cancelled','rescheduled','link_updated','reminder_24h','reminder_2h'].includes(type)
    const targetPhone = isClientMessage ? client_phone : professional_phone

    if (!targetPhone) {
      return NextResponse.json({ error: `Missing ${isClientMessage ? 'client_phone' : 'professional_phone'}` }, { status: 400 })
    }

    // Look up per-professional WhatsApp Business settings
    const settings = professional_id ? await getWaSettings(professional_id) : null

    let sent = false
    let wa_link = ''
    let wa_message_id: string | undefined
    let sendError: string | undefined

    if (settings?.phone_number_id && settings?.access_token) {
      const result = await sendWhatsApp(settings, targetPhone, type as WaMessageType, data)
      sent = result.sent
      wa_link = result.wa_link
      wa_message_id = result.wa_message_id
      sendError = result.error
    } else {
      // No Meta API configured — build wa.me link as fallback
      const digits = targetPhone.replace(/\D/g, '')
      const to = digits.startsWith('55') ? digits : `55${digits}`
      const msg = buildWaMessage(type as WaMessageType, data)
      wa_link = `https://wa.me/${to}?text=${encodeURIComponent(msg)}`
      sendError = settings ? 'Token ou Phone Number ID inválido' : 'WhatsApp Business não configurado'
    }

    const msgText = buildWaMessage(type as WaMessageType, data)
    const logStatus: 'sent' | 'failed' | 'skipped' = sent ? 'sent' : (settings ? 'failed' : 'skipped')

    await logWa({
      appointment_id,
      professional_id,
      phone: targetPhone,
      type,
      message: msgText,
      status: logStatus,
      error: sendError || null,
      meta: { appt_date, appt_time, modality, wa_message_id },
    })

    // Also update notified_wpp on appointments for new_booking
    if (type === 'new_booking' && appointment_id && sent && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await sb().from('appointments').update({ notified_wpp: true }).eq('id', appointment_id)
    }

    return NextResponse.json({ success: true, sent, wa_link, wa_message_id })
  } catch (err) {
    console.error('[wa] POST error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
