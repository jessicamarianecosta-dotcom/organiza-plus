export type WaMessageType =
  | 'booking_received'   // paciente recebe ao agendar (pendente)
  | 'new_booking'        // profissional recebe quando paciente agenda
  | 'confirmed'          // paciente recebe quando profissional confirma
  | 'cancelled'          // paciente recebe quando profissional cancela
  | 'rescheduled'        // paciente recebe quando reagendado
  | 'link_updated'       // paciente recebe quando link da reuniao muda
  | 'reminder_24h'       // lembrete 24h antes
  | 'reminder_2h'        // lembrete 2h antes
  | 'post_appointment'   // agradecimento pos-atendimento

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
  // Label dinamico: consulta | sessao | atendimento | reuniao | agendamento
  appointment_label?: string
}

const SEP = '━━━━━━━━━━━━━━━━━━'

// Preserva strings vazias (criam linha em branco); filtra apenas null/undefined
function L(...parts: (string | null | undefined)[]): string {
  return parts.filter((p): p is string => p != null).join('\n')
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function buildWaMessage(type: WaMessageType, d: WaData): string {
  const lbl = d.appointment_label ?? 'agendamento'

  switch (type) {
    case 'booking_received':
      return L(
        `\u{1F44B} Olá, *${d.client_name}*!`,
        '',
        `Recebemos sua solicitação de ${lbl}. \u{1F4CB}`,
        '',
        SEP,
        `\u{1F4C5} *Data:* ${d.appt_date}`,
        `\u{1F552} *Horário:* ${d.appt_time}`,
        d.modality ? `\u{1F4CD} *Modalidade:* ${d.modality}` : null,
        d.price    ? `\u{1F4B0} *Valor:* ${d.price}` : null,
        SEP,
        '',
        'Sua solicitação será analisada e em breve você receberá a confirmação.',
        '',
        'Obrigado! \u{1F49A}'
      )

    case 'new_booking':
      return L(
        `\u{1F4CB} *Novo ${lbl} — Organiza+*`,
        '',
        SEP,
        `\u{1F464} *Paciente:* ${d.client_name}`,
        d.client_phone ? `\u{1F4F1} *Telefone:* ${d.client_phone}` : null,
        `\u{1F4C5} *Data:* ${d.appt_date}`,
        `\u{1F552} *Horário:* ${d.appt_time}`,
        d.modality ? `\u{1F4CD} *Modalidade:* ${d.modality}` : null,
        d.price    ? `\u{1F4B0} *Valor:* ${d.price}` : null,
        SEP,
        '',
        '_Acesse seu painel para confirmar._'
      )

    case 'confirmed': {
      const loc: string[] = []
      if (d.modality === 'Online' && d.meeting_link) {
        loc.push('', '\u{1F4BB} *Link do atendimento:*', d.meeting_link)
      } else if (d.modality === 'Presencial' && (d.clinic_name || d.address)) {
        loc.push('')
        if (d.clinic_name) loc.push(`\u{1F3E5} *Local:* ${d.clinic_name}`)
        if (d.address)     loc.push(`\u{1F4CD} *Endereço:* ${d.address}`)
        if (d.maps_link)   loc.push(`\u{1F5FA} *Google Maps:* ${d.maps_link}`)
      }
      return L(
        `\u{1F44B} Olá, *${d.client_name}*!`,
        '',
        `Seu ${lbl} com *${d.professional_name}* foi confirmado. ✅`,
        '',
        SEP,
        `\u{1F4C5} *Data:* ${d.appt_date}`,
        `\u{1F552} *Horário:* ${d.appt_time}`,
        d.professional_specialty ? `\u{1FA7A} *Especialidade:* ${d.professional_specialty}` : null,
        d.modality ? `\u{1F4CD} *Modalidade:* ${d.modality}` : null,
        d.price    ? `\u{1F4B0} *Valor:* ${d.price}` : null,
        SEP,
        ...loc,
        '',
        '⚠ Em caso de imprevisto, avise com antecedência.',
        'Aguardamos você! \u{1F49A}'
      )
    }

    case 'cancelled':
      return L(
        `❌ *${cap(lbl)} cancelado*`,
        '',
        `Olá, *${d.client_name}*!`,
        '',
        `Infelizmente *${d.professional_name}* precisou cancelar seu ${lbl}.`,
        '',
        SEP,
        `\u{1F4C5} *Data:* ${d.appt_date}`,
        `\u{1F552} *Horário:* ${d.appt_time}`,
        SEP,
        '',
        'Para remarcar, entre em contato diretamente com o profissional.'
      )

    case 'rescheduled':
      return L(
        `\u{1F504} *${cap(lbl)} remarcado*`,
        '',
        `Olá, *${d.client_name}*!`,
        '',
        `Seu ${lbl} com *${d.professional_name}* foi remarcado.`,
        '',
        SEP,
        `\u{1F4C5} *Nova data:* ${d.new_date}`,
        `\u{1F552} *Novo horário:* ${d.new_time}`,
        SEP,
        '',
        'Até breve! \u{1F49A}'
      )

    case 'link_updated':
      return L(
        '\u{1F4BB} *Link atualizado*',
        '',
        `Olá, *${d.client_name}*!`,
        '',
        `O link do seu ${lbl} com *${d.professional_name}* foi atualizado.`,
        '',
        SEP,
        `\u{1F4C5} *Data:* ${d.appt_date}`,
        `\u{1F552} *Horário:* ${d.appt_time}`,
        '\u{1F4BB} *Novo link:*',
        d.meeting_link ?? '',
        SEP,
        '',
        '_O link anterior não está mais válido._'
      )

    case 'reminder_24h': {
      const loc: string[] = []
      if (d.modality === 'Online' && d.meeting_link) {
        loc.push('', '\u{1F4BB} *Link:*', d.meeting_link)
      } else if (d.modality === 'Presencial' && d.address) {
        loc.push('', `\u{1F4CD} *Endereço:* ${d.address}`)
      }
      return L(
        `\u{1F514} *Lembrete de ${lbl}*`,
        '',
        `Olá, *${d.client_name}*! Seu ${lbl} é amanhã.`,
        '',
        SEP,
        d.professional_name ? `\u{1FA7A} *Profissional:* ${d.professional_name}` : null,
        `\u{1F4C5} *Data:* ${d.appt_date}`,
        `\u{1F552} *Horário:* ${d.appt_time}`,
        d.modality ? `\u{1F4CD} *Modalidade:* ${d.modality}` : null,
        SEP,
        ...loc,
        '',
        'Até breve! \u{1F49A}'
      )
    }

    case 'reminder_2h': {
      const loc: string[] = []
      if (d.modality === 'Online' && d.meeting_link) {
        loc.push('', '\u{1F4BB} *Link:*', d.meeting_link)
      } else if (d.modality === 'Presencial' && d.address) {
        loc.push('', `\u{1F4CD} *Endereço:* ${d.address}`)
      }
      return L(
        `⏰ *Seu ${lbl} começa em breve!*`,
        '',
        `Olá, *${d.client_name}*! Seu ${lbl} começa em 2 horas.`,
        '',
        SEP,
        d.professional_name ? `\u{1FA7A} *Profissional:* ${d.professional_name}` : null,
        `\u{1F4C5} *Data:* ${d.appt_date}`,
        `\u{1F552} *Horário:* ${d.appt_time}`,
        SEP,
        ...loc,
        '',
        'Até breve! \u{1F49A}'
      )
    }

    case 'post_appointment':
      return L(
        `\u{1F64F} *Obrigado pelo seu ${lbl}!*`,
        '',
        `Olá, *${d.client_name}*!`,
        '',
        'Foi um prazer atendê-lo(a). Esperamos que tudo tenha corrido bem.',
        '',
        SEP,
        `\u{1F4C5} *Data:* ${d.appt_date}`,
        `\u{1F552} *Horário:* ${d.appt_time}`,
        SEP,
        '',
        'Se precisar remarcar ou tiver alguma dúvida, estamos à disposição. \u{1F49A}'
      )

    default:
      return ''
  }
}

export function buildWaLink(phone: string, type: WaMessageType, data: WaData): string {
  const digits = phone.replace(/\D/g, '')
  const to = digits.startsWith('55') ? digits : `55${digits}`
  const message = buildWaMessage(type, data)
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`
}
