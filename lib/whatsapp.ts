/**
 * Emojis gerados a partir do codigo numerico Unicode (nao como caracteres
 * literais no arquivo) — evita que qualquer etapa da cadeia de build/deploy
 * (editor, Git, bundler) corrompa esses caracteres especiais em transito.
 */
const EMOJI = {
  clipboard:   String.fromCodePoint(0x1f4cb), // 📋
  bell:        String.fromCodePoint(0x1f514), // 🔔
  check:       String.fromCodePoint(0x2705),  // ✅
  cross:       String.fromCodePoint(0x274c),  // ❌
  refresh:     String.fromCodePoint(0x1f504), // 🔄
  link:        String.fromCodePoint(0x1f517), // 🔗
  clock:       String.fromCodePoint(0x23f0),  // ⏰
  pray:        String.fromCodePoint(0x1f64f), // 🙏
  wave:        String.fromCodePoint(0x1f44b), // 👋
  smile:       String.fromCodePoint(0x1f60a), // 😊
  calendar:    String.fromCodePoint(0x1f4c5), // 📅
  clockFace:   String.fromCodePoint(0x1f550), // 🕐
  stethoscope: String.fromCodePoint(0x1fa7a), // 🩺
  laptop:      String.fromCodePoint(0x1f4bb), // 💻
  pin:         String.fromCodePoint(0x1f4cd), // 📍
  money:       String.fromCodePoint(0x1f4b0), // 💰
  house:       String.fromCodePoint(0x1f3e0), // 🏠
  map:         String.fromCodePoint(0x1f5fa, 0xfe0f), // 🗺️
}

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
        `${EMOJI.clipboard} Ola, *${d.client_name}*.`,
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
        `${EMOJI.bell} Novo ${lbl} recebido.`,
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
        loc.push('', `${EMOJI.link} *Link da reuniao:*`, d.meeting_link)
      } else if (d.modality === 'Presencial' && (d.clinic_name || d.address)) {
        if (d.clinic_name) loc.push('', `${EMOJI.pin} *Local:* ${d.clinic_name}`)
        if (d.address)     loc.push(`${EMOJI.house} *Endereco:* ${d.address}`)
        if (d.maps_link)   loc.push(`${EMOJI.map} *Google Maps:* ${d.maps_link}`)
      }
      return L(
        `${EMOJI.check} Ola, *${d.client_name}*. ${EMOJI.wave}`,
        '',
        `Seu ${lbl} com *${d.professional_name}* foi confirmado. ${EMOJI.check}`,
        '',
        SEP,
        '',
        `${EMOJI.calendar} *Data:* ${d.appt_date}`,
        `${EMOJI.clockFace} *Horario:* ${d.appt_time}`,
        d.professional_specialty ? `${EMOJI.stethoscope} *Especialidade:* ${d.professional_specialty}` : null,
        d.modality ? `${d.modality === 'Online' ? EMOJI.laptop : EMOJI.pin} *Modalidade:* ${d.modality}` : null,
        d.price    ? `${EMOJI.money} *Valor:* ${d.price}` : null,
        ...loc,
        '',
        SEP,
        '',
        'Em caso de imprevisto, avise com antecedencia.',
        '',
        `Aguardamos voce! ${EMOJI.smile}`
      )
    }

    case 'cancelled':
      return L(
        `${EMOJI.cross} Ola, *${d.client_name}*.`,
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
        `${EMOJI.refresh} Ola, *${d.client_name}*.`,
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
        `${EMOJI.link} Ola, *${d.client_name}*.`,
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
        `${EMOJI.clock} Ola, *${d.client_name}*.`,
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
        `${EMOJI.clock} Ola, *${d.client_name}*.`,
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
        `${EMOJI.pray} Ola, *${d.client_name}*.`,
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

/**
 * No celular, o wa.me faz o deep-link direto pro app e preserva os emojis
 * sem problema. No computador, o mesmo wa.me passa por um redirecionamento
 * (wa.me → api.whatsapp.com/send) que corrompe especificamente os emojis
 * (texto acentuado e demais simbolos chegam intactos). Por isso, no
 * desktop usamos o endereco direto do WhatsApp Web, pulando esse
 * redirecionamento problematico.
 */
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function buildWaLink(phone: string, type: WaMessageType, data: WaData): string {
  const digits = phone.replace(/\D/g, '')
  const to = digits.startsWith('55') ? digits : `55${digits}`
  const message = buildWaMessage(type, data)
  const encodedMessage = encodeURIComponent(message)
  if (isMobileDevice()) {
    return `https://wa.me/${to}?text=${encodedMessage}`
  }
  return `https://web.whatsapp.com/send?phone=${to}&text=${encodedMessage}`
}
