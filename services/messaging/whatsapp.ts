import { sendWhatsApp as metaSend, buildWaMessage } from '@/lib/whatsapp'
import type { WaMessageType, WaData } from '@/lib/whatsapp'
import { createClient } from '@supabase/supabase-js'
import type { MessageType, MessageData, SendResult } from './types'

function platformSettings() {
  return {
    phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
    access_token: process.env.WHATSAPP_ACCESS_TOKEN ?? '',
  }
}

async function isIntegrationActive(professionalId: string): Promise<boolean> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return false
  const { data } = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
    .from('integrations')
    .select('status')
    .eq('user_id', professionalId)
    .eq('provider', 'whatsapp')
    .single()
  return data?.status === 'active'
}

export async function sendWhatsAppMessage(
  professionalId: string,
  to: string,
  type: MessageType,
  data: MessageData
): Promise<SendResult> {
  const digits = to.replace(/\D/g, '')
  const phone = digits.startsWith('55') ? digits : `55${digits}`
  const message = buildWaMessage(type as WaMessageType, data as WaData)
  const fallback_link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  const active = await isIntegrationActive(professionalId)
  if (!active) return { sent: false, fallback_link, error: 'WhatsApp não conectado' }

  const settings = platformSettings()
  if (!settings.phone_number_id || !settings.access_token) {
    return { sent: false, fallback_link, error: 'Credenciais da plataforma não configuradas' }
  }

  const result = await metaSend(settings, to, type as WaMessageType, data as WaData)
  return {
    sent: result.sent,
    fallback_link: result.wa_link,
    message_id: result.wa_message_id,
    error: result.error,
  }
}
