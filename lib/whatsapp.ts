const META_VERSION = 'v19.0'
const META_BASE = 'https://graph.facebook.com'

export type WaMessageType =
  | 'booking_received'  // client receives after booking (pending)
  | 'new_booking'       // professional receives when client books
  | 'confirmed'         // client receives when professional confirms
  | 'cancelled'         // client receives when professional cancels
  | 'rescheduled'       // client receives when appointment is rescheduled
  | 'link_updated'      // client receives when meeting link changes
  | 'reminder_24h'      // client receives 24h before
  | 'reminder_2h'       // client receives 2h before

export interface WaData {
  client_name?: string
  client_phone?: string
  professional_name?: string
  professional_specialty?: string
  appt_date?: string
  appt_time?: string
  modality?: string
  price?: string
  meeting_link?: string
  clinic_name?: string
  address?: string
  maps_link?: string
  new_date?: string
  new_time?: string
}

export interface WaSettings {
  phone_number_id: string
  access_token: string
}

export interface WaSendResult {
  sent: boolean
  wa_message_id?: string
  wa_link: string
  error?: string
}

function lines(...parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join('\n')
}

export function buildWaMessage(type: WaMessageType, d: WaData): string {
  switch (type) {
    case 'booking_received':
      return lines(
        `Olá, *${d.client_name}*! 👋`,
        '',
        'Recebemos sua solicitação de agendamento.',
        '',
        `📅 *Data:* ${d.appt_date}`,
        `🕒 *Horário:* ${d.appt_time}`,
        d.modality ? `📍 *Modalidade:* ${d.modality}` : null,
        d.price    ? `💰 *Valor:* ${d.price}` : null,
        '',
        'Sua solicitação será analisada pelo profissional. Assim que for aprovada, você receberá uma nova mensagem.',
        '',
        'Obrigado! 🌿'
      )

    case 'new_booking':
      return lines(
        '📅 *Novo Agendamento — Organiza+*',
        '',
        `👤 *Paciente:* ${d.client_name}`,
        d.client_phone ? `📱 *Telefone:* ${d.client_phone}` : null,
        `📅 *Data:* ${d.appt_date}`,
        `🕒 *Horário:* ${d.appt_time}`,
        d.modality ? `📍 *Modalidade:* ${d.modality}` : null,
        d.price    ? `💰 *Valor:* ${d.price}` : null,
        '',
        '_Acesse seu painel para confirmar._'
      )

    case 'confirmed': {
      const locationParts: string[] = []
      if (d.modality === 'Online' && d.meeting_link) {
        locationParts.push('', `🔗 *Link da reunião:* ${d.meeting_link}`)
      } else if (d.modality === 'Presencial') {
        if (d.clinic_name || d.address) {
          locationParts.push('')
          if (d.clinic_name) locationParts.push(`🏥 *Local:* ${d.clinic_name}`)
          if (d.address)     locationParts.push(`📍 *Endereço:* ${d.address}`)
          if (d.maps_link)   locationParts.push(`🗺️ *Google Maps:* ${d.maps_link}`)
        }
      }
      return lines(
        '✅ *Consulta confirmada!*',
        '',
        `Olá, *${d.client_name}*! Sua consulta com *${d.professional_name}* foi confirmada.`,
        d.professional_specialty ? `🩺 *Especialidade:* ${d.professional_specialty}` : null,
        '',
        `📅 *Data:* ${d.appt_date}`,
        `🕒 *Horário:* ${d.appt_time}`,
        d.modality ? `📍 *Modalidade:* ${d.modality}` : null,
        d.price    ? `💰 *Valor:* ${d.price}` : null,
        ...locationParts,
        '',
        '_Em caso de imprevisto, avise com antecedência. Até breve!_ 🌿'
      )
    }

    case 'cancelled':
      return lines(
        '❌ *Agendamento cancelado*',
        '',
        `Olá, *${d.client_name}*. Infelizmente *${d.professional_name}* precisou cancelar sua consulta.`,
        '',
        `📅 *Data:* ${d.appt_date}`,
        `🕒 *Horário:* ${d.appt_time}`,
        '',
        '_Para remarcar, entre em contato diretamente com o profissional._'
      )

    case 'rescheduled':
      return lines(
        '🔄 *Agendamento alterado*',
        '',
        `Olá, *${d.client_name}*! Seu agendamento com *${d.professional_name}* foi alterado.`,
        '',
        `📅 *Nova data:* ${d.new_date}`,
        `🕒 *Novo horário:* ${d.new_time}`,
        '',
        '_Até breve!_ 🌿'
      )

    case 'link_updated':
      return lines(
        '🔗 *Link da consulta atualizado*',
        '',
        `Olá, *${d.client_name}*! O link da sua consulta com *${d.professional_name}* foi atualizado.`,
        '',
        `📅 *Data:* ${d.appt_date}`,
        `🕒 *Horário:* ${d.appt_time}`,
        `🔗 *Novo link:* ${d.meeting_link}`,
        '',
        '_Guarde este link. O anterior não está mais válido._'
      )

    case 'reminder_24h':
      return lines(
        '🔔 *Lembrete de consulta*',
        '',
        `Olá, *${d.client_name}*! Sua consulta é amanhã.`,
        '',
        d.professional_name ? `👨‍⚕️ *Profissional:* ${d.professional_name}` : null,
        `📅 *Data:* ${d.appt_date}`,
        `🕒 *Horário:* ${d.appt_time}`,
        d.modality ? `📍 *Modalidade:* ${d.modality}` : null,
        d.modality === 'Online' && d.meeting_link ? `🔗 *Link:* ${d.meeting_link}` : null,
        d.modality === 'Presencial' && d.address  ? `📍 *Endereço:* ${d.address}` : null,
        '',
        'Até breve! 🌿'
      )

    case 'reminder_2h':
      return lines(
        '⏰ *Sua consulta é em breve!*',
        '',
        `Olá, *${d.client_name}*! Lembrete: sua consulta começa em 2 horas.`,
        '',
        d.professional_name ? `👨‍⚕️ *Profissional:* ${d.professional_name}` : null,
        `📅 *Data:* ${d.appt_date}`,
        `🕒 *Horário:* ${d.appt_time}`,
        d.modality === 'Online' && d.meeting_link ? `🔗 *Link:* ${d.meeting_link}` : null,
        d.modality === 'Presencial' && d.address  ? `📍 *Endereço:* ${d.address}` : null,
        '',
        'Até breve! 🌿'
      )

    default:
      return ''
  }
}

export async function sendWhatsApp(
  settings: WaSettings,
  phone: string,
  type: WaMessageType,
  data: WaData
): Promise<WaSendResult> {
  const digits = phone.replace(/\D/g, '')
  const to = digits.startsWith('55') ? digits : `55${digits}`
  const message = buildWaMessage(type, data)
  const wa_link = `https://wa.me/${to}?text=${encodeURIComponent(message)}`

  if (!settings.phone_number_id || !settings.access_token) {
    return { sent: false, wa_link, error: 'WhatsApp Business não configurado' }
  }
  if (!message) {
    return { sent: false, wa_link, error: 'Tipo de mensagem desconhecido' }
  }

  try {
    const res = await fetch(
      `${META_BASE}/${META_VERSION}/${settings.phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.access_token}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message, preview_url: false },
        }),
      }
    )
    const json = await res.json()
    if (!res.ok) {
      const error = json?.error?.message || `HTTP ${res.status}: ${JSON.stringify(json)}`
      return { sent: false, wa_link, error }
    }
    return { sent: true, wa_link, wa_message_id: json?.messages?.[0]?.id }
  } catch (e: any) {
    return { sent: false, wa_link, error: String(e) }
  }
}
