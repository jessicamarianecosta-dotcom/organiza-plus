import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function buildSupabase() {
  const cookieStore = cookies() as any
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

// Message templates
function msgNewBooking(d: { client_name: string; client_phone: string; appt_date: string; appt_time: string; modality?: string; price?: string }) {
  const modalityLine = d.modality ? `\n📍 *Modalidade:* ${d.modality}` : ''
  const priceLine = d.price ? `\n💰 *Valor:* ${d.price}` : ''
  return `✅ *Novo Agendamento — Organiza+*\n\n👤 *Paciente:* ${d.client_name}\n📱 *Telefone:* ${d.client_phone}\n📅 *Data:* ${d.appt_date}\n🕐 *Horário:* ${d.appt_time}${modalityLine}${priceLine}\n\n_Acesse seu painel para confirmar._`
}

function msgConfirmed(d: { client_name: string; professional_name: string; appt_date: string; appt_time: string; modality?: string; price?: string; meeting_link?: string; clinic_name?: string; address?: string; maps_link?: string }) {
  const modalityLine = d.modality ? `\n📍 *Modalidade:* ${d.modality}` : ''
  const priceLine = d.price ? `\n💰 *Valor:* ${d.price}` : ''
  let locationLines = ''
  if (d.modality === 'Online' && d.meeting_link) {
    locationLines = `\n\n🔗 *Link da reunião:* ${d.meeting_link}`
  } else if (d.modality === 'Presencial') {
    if (d.clinic_name) locationLines += `\n\n🏥 *Local:* ${d.clinic_name}`
    if (d.address) locationLines += `\n📍 *Endereço:* ${d.address}`
    if (d.maps_link) locationLines += `\n🗺️ *Google Maps:* ${d.maps_link}`
  }
  return `✅ *Consulta confirmada!*\n\nOlá, *${d.client_name}*! Sua consulta com *${d.professional_name}* foi confirmada.\n\n📅 *Data:* ${d.appt_date}\n🕐 *Horário:* ${d.appt_time}${modalityLine}${priceLine}${locationLines}\n\n_Em caso de imprevisto, avise com antecedência. Até breve!_ 🌿`
}

function msgCancelled(d: { client_name: string; professional_name: string; appt_date: string; appt_time: string }) {
  return `❌ *Agendamento cancelado*\n\nOlá, *${d.client_name}*. Infelizmente *${d.professional_name}* precisou cancelar sua consulta.\n\n📅 *Data:* ${d.appt_date}\n🕐 *Horário:* ${d.appt_time}\n\n_Para remarcar, entre em contato diretamente com o profissional._`
}

function msgLinkUpdated(d: { client_name: string; professional_name: string; appt_date: string; appt_time: string; meeting_link: string }) {
  return `🔗 *Link da consulta atualizado*\n\nOlá, *${d.client_name}*! O link da sua consulta com *${d.professional_name}* foi atualizado.\n\n📅 *Data:* ${d.appt_date}\n🕐 *Horário:* ${d.appt_time}\n🔗 *Novo link:* ${d.meeting_link}\n\n_Guarde este link. O anterior não está mais válido._`
}

async function sendWpp(phone: string, msg: string): Promise<{ sent: boolean; waLink: string; error?: string }> {
  const digits = phone.replace(/\D/g, '')
  const waLink = `https://wa.me/55${digits}?text=${encodeURIComponent(msg)}`

  const apiUrl = process.env.WHATSAPP_API_URL
  const token  = process.env.WHATSAPP_API_TOKEN
  const inst   = process.env.WHATSAPP_INSTANCE

  if (apiUrl && token && inst) {
    try {
      const res = await fetch(`${apiUrl}/message/sendText/${inst}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: token },
        body: JSON.stringify({ number: `55${digits}@s.whatsapp.net`, text: msg }),
      })
      if (res.ok) return { sent: true, waLink }
      const err = await res.text()
      return { sent: false, waLink, error: `Evolution API error: ${res.status} ${err}` }
    } catch (e: any) {
      return { sent: false, waLink, error: String(e) }
    }
  }

  // No API configured — return the wa.me link so the caller can open it manually
  return { sent: false, waLink }
}

async function log(supabase: ReturnType<typeof buildSupabase>, entry: {
  appointment_id?: string | null
  professional_id?: string | null
  channel: 'email' | 'whatsapp'
  recipient: string
  event_type: string
  status: 'sent' | 'failed' | 'skipped'
  error_message?: string | null
  metadata?: Record<string, unknown>
}) {
  await supabase.from('notification_logs').insert({
    appointment_id: entry.appointment_id || null,
    professional_id: entry.professional_id || null,
    channel: entry.channel,
    recipient: entry.recipient,
    event_type: entry.event_type,
    status: entry.status,
    error_message: entry.error_message || null,
    metadata: entry.metadata || {},
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      type = 'new_booking',
      appointment_id,
      professional_id,
      // new_booking fields (notify professional)
      professional_phone,
      professional_name,
      // client-facing fields
      client_phone,
      client_name,
      // common
      appt_date,
      appt_time,
      modality,
      price,
      // confirmation details
      meeting_link,
      clinic_name,
      address,
      maps_link,
    } = body

    const supabase = buildSupabase()

    if (type === 'confirmed') {
      if (!client_phone) return NextResponse.json({ error: 'Missing client_phone' }, { status: 400 })
      const msg = msgConfirmed({ client_name, professional_name, appt_date, appt_time, modality, price, meeting_link, clinic_name, address, maps_link })
      const { sent, waLink, error } = await sendWpp(client_phone, msg)

      await log(supabase, {
        appointment_id,
        professional_id,
        channel: 'whatsapp',
        recipient: client_phone,
        event_type: 'appointment_confirmed',
        status: sent ? 'sent' : (process.env.WHATSAPP_API_URL ? 'failed' : 'skipped'),
        error_message: error || null,
        metadata: { appt_date, appt_time, modality, price, meeting_link },
      })

      return NextResponse.json({ success: true, sent, waLink })
    }

    if (type === 'cancelled') {
      if (!client_phone) return NextResponse.json({ error: 'Missing client_phone' }, { status: 400 })
      const msg = msgCancelled({ client_name, professional_name, appt_date, appt_time })
      const { sent, waLink, error } = await sendWpp(client_phone, msg)

      await log(supabase, {
        appointment_id,
        professional_id,
        channel: 'whatsapp',
        recipient: client_phone,
        event_type: 'appointment_cancelled',
        status: sent ? 'sent' : (process.env.WHATSAPP_API_URL ? 'failed' : 'skipped'),
        error_message: error || null,
        metadata: { appt_date, appt_time },
      })

      return NextResponse.json({ success: true, sent, waLink })
    }

    if (type === 'link_updated') {
      if (!client_phone) return NextResponse.json({ error: 'Missing client_phone' }, { status: 400 })
      if (!meeting_link) return NextResponse.json({ error: 'Missing meeting_link' }, { status: 400 })
      const msg = msgLinkUpdated({ client_name, professional_name, appt_date, appt_time, meeting_link })
      const { sent, waLink, error } = await sendWpp(client_phone, msg)

      await log(supabase, {
        appointment_id,
        professional_id,
        channel: 'whatsapp',
        recipient: client_phone,
        event_type: 'meeting_link_updated',
        status: sent ? 'sent' : (process.env.WHATSAPP_API_URL ? 'failed' : 'skipped'),
        error_message: error || null,
        metadata: { meeting_link },
      })

      return NextResponse.json({ success: true, sent, waLink })
    }

    // Default: new_booking — notify PROFESSIONAL about new patient
    if (!professional_phone) return NextResponse.json({ error: 'Missing professional_phone' }, { status: 400 })
    const msg = msgNewBooking({ client_name, client_phone, appt_date, appt_time, modality, price })
    const { sent, waLink, error } = await sendWpp(professional_phone, msg)

    if (appointment_id) {
      await supabase.from('appointments').update({ notified_wpp: true }).eq('id', appointment_id)
    }

    await log(supabase, {
      appointment_id,
      professional_id,
      channel: 'whatsapp',
      recipient: professional_phone,
      event_type: 'new_booking',
      status: sent ? 'sent' : (process.env.WHATSAPP_API_URL ? 'failed' : 'skipped'),
      error_message: error || null,
      metadata: { client_name, client_phone, appt_date, appt_time },
    })

    return NextResponse.json({ success: true, sent, waLink })
  } catch (err) {
    console.error('WhatsApp error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
