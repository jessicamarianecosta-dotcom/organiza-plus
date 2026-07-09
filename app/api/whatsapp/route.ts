import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { MessagingService } from '@/services/messaging'
import type { MessageType, MessageData } from '@/services/messaging'

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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

    if (!professional_id) {
      return NextResponse.json({ success: false, error: 'professional_id is required' }, { status: 400 })
    }

    const data: MessageData = {
      client_name, client_phone, professional_name, professional_specialty,
      appt_date, appt_time, modality, price,
      meeting_link, clinic_name, address, maps_link,
      new_date, new_time,
    }

    // Client-directed events go to client_phone; professional events go to professional_phone
    const isClientMessage = [
      'confirmed', 'cancelled', 'rescheduled', 'link_updated',
      'reminder_24h', 'reminder_2h', 'booking_received',
    ].includes(type)
    const targetPhone = isClientMessage ? client_phone : professional_phone

    if (!targetPhone) {
      return NextResponse.json(
        { error: `Missing ${isClientMessage ? 'client_phone' : 'professional_phone'}` },
        { status: 400 }
      )
    }

    const result = await MessagingService.sendWhatsApp({
      professionalId: professional_id,
      to: targetPhone,
      type: type as MessageType,
      data,
      appointmentId: appointment_id,
    })

    if (type === 'new_booking' && appointment_id && result.sent && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await sb().from('appointments').update({ notified_wpp: true }).eq('id', appointment_id)
    }

    return NextResponse.json({ success: true, sent: result.sent, wa_link: result.fallback_link, message_id: result.message_id })
  } catch (err) {
    console.error('[wa] POST error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
