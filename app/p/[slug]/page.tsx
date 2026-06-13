'use client'
import { useState, useEffect, use } from 'react'
import { supabase, Profile, Availability } from '@/lib/supabase'
import { MapPin, Clock, Monitor, Heart, Phone } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function generateSlots(start: string, end: string, mins: number) {
  const slots: string[] = []
  let [h,m] = start.split(':').map(Number)
  const [eh,em] = end.split(':').map(Number)
  while (h < eh || (h===eh && m < em)) {
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    m += mins
    if (m >= 60) { h += Math.floor(m/60); m = m%60 }
  }
  return slots
}

async function trackEvent(professionalId: string, type: string, meta?: Record<string,string>) {
  await supabase.from('analytics_events').insert({ professional_id: professionalId, event_type: type, metadata: meta || {} })
}

export default function PublicProfile({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = use(params)
  const [profile, setProfile]         = useState<Profile|null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading]         = useState(true)
  const [notFound, setNotFound]       = useState(false)
  const [selectedDate, setSelectedDate] = useState<string|null>(null)
  const [selectedTime, setSelectedTime] = useState<string|null>(null)
  const [takenSlots, setTakenSlots]   = useState<string[]>([])
  const [step, setStep]               = useState<'pick'|'form'|'done'>('pick')
  const [clientName, setClientName]   = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [notes, setNotes]             = useState('')
  const [submitting, setSubmitting]   = useState(false)

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('profiles').select('*').eq('slug', slug).single()
      if (!p) { setNotFound(true); setLoading(false); return }
      setProfile(p)
      const { data: a } = await supabase.from('availability').select('*').eq('professional_id', p.id).eq('active',true)
      setAvailability(a || [])
      setLoading(false)
      trackEvent(p.id, 'page_view')
    }
    load()
  }, [slug])

  useEffect(() => {
    if (!profile || !selectedDate) return
    supabase.from('appointments').select('appt_time')
      .eq('professional_id', profile.id).eq('appt_date', selectedDate)
      .in('status', ['pending','confirmed'])
      .then(({ data }) => setTakenSlots((data||[]).map(a=>a.appt_time.slice(0,5))))
  }, [profile, selectedDate])

  const weekDates = Array.from({length:14}).map((_,i) => addDays(new Date(),i))
    .filter(d => availability.some(a => a.day_of_week === d.getDay()))

  const dayAvail  = selectedDate ? availability.find(a => a.day_of_week === new Date(selectedDate+'T12:00').getDay()) : null
  const slots     = dayAvail ? generateSlots(dayAvail.start_time, dayAvail.end_time, dayAvail.slot_minutes) : []

  async function handleBook(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || !selectedDate || !selectedTime) return
    setSubmitting(true)

    const { data: appt, error } = await supabase.from('appointments').insert({
      professional_id: profile.id,
      client_name: clientName, client_phone: clientPhone,
      client_email: clientEmail || null, notes: notes || null,
      appt_date: selectedDate, appt_time: selectedTime+':00',
    }).select().single()

    if (!error && appt) {
      // Track analytics
      await trackEvent(profile.id, 'booking_completed', { date: selectedDate, time: selectedTime })

      // Send WhatsApp notification
      if (profile.whatsapp) {
        await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointment_id: appt.id,
            professional_phone: profile.whatsapp,
            professional_name: profile.name,
            client_name: clientName, client_phone: clientPhone,
            appt_date: selectedDate, appt_time: selectedTime,
          }),
        })
      }

      // Send confirmation email to client
      if (clientEmail) {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'confirmation', to: clientEmail,
            client: clientName, professional: profile.name,
            date: selectedDate, time: selectedTime,
          }),
        })
      }

      setStep('done')
    }
    setSubmitting(false)
  }

  function handleWhatsAppClick() {
    if (!profile?.whatsapp) return
    if (profile.id) trackEvent(profile.id, 'whatsapp_click')
    const wppNum = profile.whatsapp.replace(/\D/g,'')
    window.open(`https://wa.me/55${wppNum}`, '_blank')
  }

  if (loading) return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center">
      <div className="font-display text-2xl text-sage animate-pulse">Organiza+</div>
    </div>
  )
  if (notFound) return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center text-center px-4">
      <div>
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="font-display text-3xl text-brand-dark mb-2">Página não encontrada</h1>
        <p className="text-brand-muted">Este profissional não existe ou o link está incorreto.</p>
      </div>
    </div>
  )
  if (!profile) return null

  return (
    <div className="min-h-screen bg-offwhite">
      {/* HEADER */}
      <div className="py-10 px-6" style={{background:'linear-gradient(135deg, #2C3530 0%, #3d4f47 100%)'}}>
        <div className="max-w-2xl mx-auto">
          <div className="w-24 h-24 rounded-full bg-sage-pale border-4 border-white/20 flex items-center justify-center text-4xl mb-5 overflow-hidden">
            {profile.photo_url
              ? <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover"/>
              : '👩‍⚕️'}
          </div>
          <h1 className="font-display text-3xl text-cream">{profile.name}</h1>
          <p className="text-sage-light font-medium mt-1">{profile.profession}{profile.crm_cro_crp && ` — ${profile.crm_cro_crp}`}</p>
          <div className="flex flex-wrap gap-3 mt-3">
            {profile.city && <span className="flex items-center gap-1.5 text-white/50 text-sm"><MapPin size={13}/>{profile.city}{profile.state && `, ${profile.state}`}</span>}
            {profile.online    && <span className="flex items-center gap-1.5 text-white/50 text-sm"><Monitor size={13}/>Online</span>}
            {profile.in_person && <span className="flex items-center gap-1.5 text-white/50 text-sm"><Heart size={13}/>Presencial</span>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.specialties.map(s => (
              <span key={s} className="bg-sage-glow border border-sage-pale text-sage text-xs font-semibold px-3 py-1.5 rounded-full">{s}</span>
            ))}
          </div>
        )}
        {profile.bio && (
          <div className="bg-white rounded-2xl p-6 border border-nude/40 shadow-soft">
            <h2 className="font-bold text-brand-dark text-sm mb-2">Sobre</h2>
            <p className="text-brand-mid text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* BOOKING */}
        <div className="bg-white rounded-2xl border border-nude/40 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-nude">
            <h2 className="font-bold text-brand-dark flex items-center gap-2"><Clock size={16} className="text-sage"/> Agendar consulta</h2>
          </div>

          {step === 'done' ? (
            <div className="py-16 text-center px-6">
              <p className="text-5xl mb-4">✅</p>
              <h3 className="font-display text-2xl text-brand-dark mb-2">Agendamento realizado!</h3>
              <p className="text-brand-muted text-sm mb-1">Data: <strong>{selectedDate}</strong> às <strong>{selectedTime}</strong></p>
              {clientEmail && <p className="text-brand-muted text-sm">Confirmação enviada para <strong>{clientEmail}</strong></p>}
              <button onClick={() => { setStep('pick'); setSelectedDate(null); setSelectedTime(null); setClientName(''); setClientPhone(''); setClientEmail(''); setNotes('') }}
                className="mt-6 text-sage text-sm font-semibold hover:underline">Fazer outro agendamento</button>
            </div>
          ) : step === 'form' ? (
            <form onSubmit={handleBook} className="p-6 space-y-4">
              <div className="bg-sage-glow rounded-xl px-4 py-3 text-sm text-sage font-semibold">
                📅 {selectedDate} às {selectedTime}
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Seu nome *</label>
                <input required value={clientName} onChange={e=>setClientName(e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Telefone / WhatsApp *</label>
                <input required value={clientPhone} onChange={e=>setClientPhone(e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite" placeholder="(11) 99999-9999"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">E-mail <span className="text-brand-muted font-normal">(receba confirmação)</span></label>
                <input type="email" value={clientEmail} onChange={e=>setClientEmail(e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite" placeholder="seu@email.com"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Observações <span className="text-brand-muted font-normal">(opcional)</span></label>
                <textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite resize-none"/>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={()=>setStep('pick')} className="px-5 py-3.5 border-2 border-nude rounded-xl text-sm font-semibold text-brand-dark hover:border-sage transition-colors">← Voltar</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-brand-dark text-cream font-semibold py-3.5 rounded-xl hover:bg-sage transition-colors disabled:opacity-50">
                  {submitting ? 'Agendando...' : 'Confirmar agendamento →'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              {weekDates.length === 0 ? (
                <p className="text-center text-brand-muted text-sm py-6">Nenhum horário disponível no momento.</p>
              ) : (
                <>
                  <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">Escolha uma data</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
                    {weekDates.map(d => {
                      const ds = format(d,'yyyy-MM-dd')
                      return (
                        <button key={ds} onClick={()=>{setSelectedDate(ds);setSelectedTime(null)}}
                          className={`shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border-2 transition-all ${selectedDate===ds ? 'bg-sage border-sage text-white' : 'border-nude bg-offwhite text-brand-dark hover:border-sage-light'}`}>
                          <span className="text-[10px] font-bold uppercase">{format(d,'EEE',{locale:ptBR})}</span>
                          <span className="text-xl font-bold">{format(d,'dd')}</span>
                          <span className="text-[10px]">{format(d,'MMM',{locale:ptBR})}</span>
                        </button>
                      )
                    })}
                  </div>
                  {selectedDate && (
                    <>
                      <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">Horários disponíveis</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {slots.map(s => {
                          const taken = takenSlots.includes(s)
                          return (
                            <button key={s} disabled={taken} onClick={()=>setSelectedTime(s)}
                              className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${taken ? 'border-nude text-brand-muted/40 cursor-not-allowed bg-offwhite' : selectedTime===s ? 'bg-sage border-sage text-white' : 'border-nude bg-offwhite text-brand-dark hover:border-sage hover:bg-sage-glow'}`}>
                              {s}{taken && ' ✗'}
                            </button>
                          )
                        })}
                      </div>
                      {selectedTime && (
                        <button onClick={()=>{ trackEvent(profile!.id,'booking_started'); setStep('form') }}
                          className="w-full bg-brand-dark text-cream font-semibold py-4 rounded-xl hover:bg-sage transition-colors">
                          Continuar → {selectedTime}
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {profile.whatsapp && (
          <button onClick={handleWhatsAppClick}
            className="flex items-center justify-center gap-3 w-full bg-green-500 text-white font-semibold py-4 rounded-2xl hover:bg-green-600 transition-colors">
            <Phone size={18}/> Falar pelo WhatsApp
          </button>
        )}

        <div className="text-center py-4">
          <p className="text-xs text-brand-muted">Powered by <span className="font-semibold text-sage">Organiza+</span></p>
        </div>
      </div>
    </div>
  )
}
