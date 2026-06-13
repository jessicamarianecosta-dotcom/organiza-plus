import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  created_at: string
}

export type BlockedDate = {
  id: string
  professional_id: string
  blocked_date: string
  reason: string | null
}
