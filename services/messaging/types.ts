export type MessageType =
  | 'booking_received'
  | 'new_booking'
  | 'confirmed'
  | 'cancelled'
  | 'rescheduled'
  | 'link_updated'
  | 'reminder_24h'
  | 'reminder_2h'

export interface MessageData {
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

export interface SendResult {
  sent: boolean
  fallback_link?: string
  message_id?: string
  error?: string
}
