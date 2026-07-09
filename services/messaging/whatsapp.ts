import { sendWhatsApp as metaSend, buildWaMessage } from '@/lib/whatsapp'
import type { WaMessageType, WaData } from '@/lib/whatsapp'
import { createClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/crypto'
import type { MessageType, MessageData, SendResult } from './types'

interface StoredCredentials {
  access_token: string
  phone_number_id: string
  waba_id?: string
}

async function getCredentials(professionalId: string): Promise<StoredCredentials | null> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null

  const { data } = await createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
    .from('integrations')
    .select('encrypted_credentials, status')
    .eq('user_id', professionalId)
    .eq('provider', 'whatsapp')
    .single()

  if (!data || data.status !== 'active' || !data.encrypted_credentials) return null

  try {
    return JSON.parse(decrypt(data.encrypted_credentials)) as StoredCredentials
  } catch {
    return null
  }
}

async function markIntegrationError(professionalId: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key)
    .from('integrations')
    .update({ status: 'error', updated_at: new Date().toISOString() })
    .eq('user_id', professionalId)
    .eq('provider', 'whatsapp')
    .then(() => {}, () => {})
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

  const credentials = await getCredentials(professionalId)
  if (!credentials) {
    return { sent: false, fallback_link, error: 'WhatsApp não conectado' }
  }

  const result = await metaSend(
    { phone_number_id: credentials.phone_number_id, access_token: credentials.access_token },
    to,
    type as WaMessageType,
    data as WaData
  )

  // If token-related error, mark integration for reconnection
  if (!result.sent && result.error && /token|oauth|expired/i.test(result.error)) {
    markIntegrationError(professionalId)
  }

  return {
    sent: result.sent,
    fallback_link: result.wa_link,
    message_id: result.wa_message_id,
    error: result.error,
  }
}
