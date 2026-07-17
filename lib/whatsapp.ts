export type WaMessageType =
  | 'booking_received'
  | 'new_booking'
  | 'confirmed'
  | 'cancelled'
  | 'rescheduled'
  | 'link_updated'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'post_appointment'

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
  appointment_label?: string
}

const SEP = '─'.repeat(24)

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
        `Ola, *${d.client_name}*.`,
        '',
        `Recebemos sua solicitacao de ${lbl}.`,
        '',
        SEP,
        '',
        `*Data:* ${d.appt_date}`,
        `*Horario:* ${d.appt_time}`,
        d.modality ? `*Modalidade:* ${d.modality}` : null,
        d.price    ? `*Valor:* ${d.price}` : null,
        '',
        SEP,
        '',
        'Sua solicitacao sera analisada e em breve voce recebera a confirmacao.'
      )

    case 'new_booking':
      return L(
        `Novo ${lbl} recebido.`,
        '',
        SEP,
        '',
        `*Paciente:* ${d.client_name}`,
        d.client_phone ? `*Telefone:* ${d.client_phone}` : null,
        `*Data:* ${d.appt_date}`,
        `*Horario:* ${d.appt_time}`,
        d.modality ? `*Modalidade:* ${d.modality}` : null,
        d.price    ? `*Valor:* ${d.price}` : null,
        '',
        SEP,
        '',
        'Acesse seu painel para confirmar.'
      )

    case 'confirmed': {
      const loc: string[] = []
      if (d.modality === 'Online' && d.meeting_link) {
        loc.push('', '*Link da reuniao:*', d.meeting_link)
      } else if (d.modality === 'Presencial' && (d.clinic_name || d.address)) {
        if (d.clinic_name) loc.push('', `*Local:* ${d.clinic_name}`)
        if (d.address)     loc.push(`*Endereco:* ${d.address}`)
        if (d.maps_link)   loc.push(`*Google Maps:* ${d.maps_link}`)
      }
      return L(
        `Ola, *${d.client_name}*.`,
        '',
        `Seu ${lbl} com *${d.professional_name}* foi confirmado.`,
        '',
        SEP,
        '',
        `*Data:* ${d.appt_date}`,
        `*Horario:* ${d.appt_time}`,
        d.professional_specialty ? `*Especialidade:* ${d.professional_specialty}` : null,
        d.modality ? `*Modalidade:* ${d.modality}` : null,
        d.price    ? `*Valor:* ${d.price}` : null,
        ...loc,
        '',
        SEP,
        '',
        'Em caso de imprevisto, avise com antecedencia.',
        '',
        'Aguardamos voce!'
      )
    }

    case 'cancelled':
      return L(
        `Ola, *${d.client_name}*.`,
        '',
        `Seu ${lbl} com *${d.professional_name}* foi cancelado.`,
        '',
        SEP,
        '',
        `*Data:* ${d.appt_date}`,
        `*Horario:* ${d.appt_time}`,
        '',
        SEP,
        '',
        'Para remarcar, entre em contato diretamente com o profissional.'
      )

    case 'rescheduled':
      return L(
        `Ola, *${d.client_name}*.`,
        '',
        `Seu ${lbl} com *${d.professional_name}* foi remarcado.`,
        '',
        SEP,
        '',
        `*Nova data:* ${d.new_date}`,
        `*Novo horario:* ${d.new_time}`,
        '',
        SEP,
        '',
        'Ate breve!'
      )

    case 'link_updated':
      return L(
        `Ola, *${d.client_name}*.`,
        '',
        `O link do seu ${lbl} com *${d.professional_name}* foi atualizado.`,
        '',
        SEP,
        '',
        `*Data:* ${d.appt_date}`,
        `*Horario:* ${d.appt_time}`,
        '',
        '*Novo link:*',
        d.meeting_link ?? '',
        '',
        SEP,
        '',
        'O link anterior nao esta mais valido.'
      )

    case 'reminder_24h': {
      const loc: string[] = []
      if (d.modality === 'Online' && d.meeting_link) {
        loc.push('', '*Link:*', d.meeting_link)
      } else if (d.modality === 'Presencial' && d.address) {
        loc.push('', `*Endereco:* ${d.address}`)
      }
      return L(
        `Ola, *${d.client_name}*.`,
        '',
        `Seu ${lbl} esta agendado para amanha.`,
        '',
        SEP,
        '',
        d.professional_name ? `*Profissional:* ${d.professional_name}` : null,
        `*Data:* ${d.appt_date}`,
        `*Horario:* ${d.appt_time}`,
        d.modality ? `*Modalidade:* ${d.modality}` : null,
        ...loc,
        '',
        SEP,
        '',
        'Ate breve!'
      )
    }

    case 'reminder_2h': {
      const loc: string[] = []
      if (d.modality === 'Online' && d.meeting_link) {
        loc.push('', '*Link:*', d.meeting_link)
      } else if (d.modality === 'Presencial' && d.address) {
        loc.push('', `*Endereco:* ${d.address}`)
      }
      return L(
        `Ola, *${d.client_name}*.`,
        '',
        `Seu ${lbl} comeca em 2 horas.`,
        '',
        SEP,
        '',
        d.professional_name ? `*Profissional:* ${d.professional_name}` : null,
        `*Data:* ${d.appt_date}`,
        `*Horario:* ${d.appt_time}`,
        ...loc,
        '',
        SEP,
        '',
        'Ate breve!'
      )
    }

    case 'post_appointment':
      return L(
        `Ola, *${d.client_name}*.`,
        '',
        `Obrigado pelo seu ${lbl}!`,
        '',
        'Foi um prazer atende-lo(a). Esperamos que tudo tenha corrido bem.',
        '',
        SEP,
        '',
        `*Data:* ${d.appt_date}`,
        `*Horario:* ${d.appt_time}`,
        '',
        SEP,
        '',
        'Se precisar remarcar ou tiver alguma duvida, estamos a disposicao.'
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
