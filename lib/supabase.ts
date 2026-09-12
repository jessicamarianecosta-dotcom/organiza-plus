import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// A hung/blocked request (bad network, stale session token) left pages stuck
// on their "checking session" spinner forever (e.g. /cadastro). Wrap any
// promise that gates page render with this so it always settles.
export function withTimeout<T>(promise: PromiseLike<T>, timeoutMs = 6000): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
  ])
}

// Every page-mount auth check should use this instead of calling
// supabase.auth.getUser() directly — see withTimeout above.
export async function getUserSafe(timeoutMs = 6000): Promise<{ user: User | null }> {
  try {
    const { data } = await withTimeout(supabase.auth.getUser(), timeoutMs)
    return { user: data.user }
  } catch {
    return { user: null }
  }
}

export type Profile = {
  id: string
  name: string
  slug: string
  profession: string
  bio: string | null
  photo_url: string | null
  whatsapp: string | null
  city: string | null
  state: string | null
  specialties: string[] | null
  online: boolean
  in_person: boolean
  plan: 'basic' | 'premium'
  plan_active: boolean
  crm_cro_crp: string | null
  instagram: string | null
  // modality & pricing
  online_platform: string | null
  online_price: number | null
  presential_price: number | null
  clinic_name: string | null
  clinic_address: string | null
  clinic_maps_link: string | null
  theme_color: string | null
  onboarding_done: boolean
  email: string | null
  created_at: string
}

export type Availability = {
  id: string
  professional_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_minutes: number
  active: boolean
}

export type Appointment = {
  id: string
  professional_id: string
  client_name: string
  client_phone: string
  client_email: string | null
  appt_date: string
  appt_time: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notified_wpp: boolean
  confirmed_at: string | null
  appointment_type: 'online' | 'presencial' | null
  appointment_price: number | null
  meeting_link: string | null
  created_at: string
}

export type NotificationLog = {
  id: string
  appointment_id: string | null
  professional_id: string | null
  channel: 'email' | 'whatsapp'
  recipient: string
  event_type: string
  status: 'sent' | 'failed' | 'skipped'
  error_message: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type BlockedDate = {
  id: string
  professional_id: string
  blocked_date: string
  reason: string | null
}

export type ScheduleBreak = {
  id: string
  professional_id: string
  weekday: number
  start_time: string
  end_time: string
  description: string | null
  created_at: string
}

export type Integration = {
  id: string
  user_id: string
  provider: 'whatsapp' | 'email' | 'sms' | 'telegram'
  provider_type: string | null
  status: 'active' | 'inactive' | 'error'
  config_json: Record<string, unknown>
  last_used_at: string | null
  created_at: string
  updated_at: string
}
