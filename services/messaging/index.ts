import { createClient } from '@supabase/supabase-js'
import { sendWhatsAppMessage } from './whatsapp'
import type { MessageType, MessageData, SendResult } from './types'

export class MessagingService {
  static async sendWhatsApp(opts: {
    professionalId: string
    to: string
    type: MessageType
    data: MessageData
    appointmentId?: string | null
  }): Promise<SendResult> {
    const result = await sendWhatsAppMessage(opts.professionalId, opts.to, opts.type, opts.data)

    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (key) {
      const logStatus: 'sent' | 'failed' | 'skipped' = result.sent
        ? 'sent'
        : result.error?.includes('não conectado')
          ? 'skipped'
          : 'failed'
      createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
        .from('whatsapp_logs')
        .insert({
          appointment_id: opts.appointmentId ?? null,
          professional_id: opts.professionalId,
          phone: opts.to,
          type: opts.type,
          message: '',
          status: logStatus,
          error: result.error ?? null,
          meta: {},
        })
        .then(() => {}, () => {})
    }

    return result
  }
}

export { sendWhatsAppMessage } from './whatsapp'
export * from './types'
