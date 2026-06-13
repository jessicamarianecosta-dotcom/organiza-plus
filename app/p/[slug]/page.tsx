'use client'
import { useState, useEffect, use } from 'react'
import { supabase, Profile, Availability } from '@/lib/supabase'
import { T, GlobalStyles } from '@/lib/ds'
import { MapPin, Clock, Monitor, Heart, Phone, Star, CheckCircle } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

function genSlots(start: string, end: string, mins: number) {
  const slots: string[] = []
  let [h,m] = start.split(':').map(Number)
  const [eh,em] = end.split(':').map(Number)
  while (h < eh || (h===eh && m < em)) {
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    m += mins; if (m>=60) { h+=Math.floor(m/60); m=m%60 }
  }
  return slots
}

async function trackEvent(pid: string, type: string) {
  await supabase.from('analytics_events').insert({ professional_id:pid, event_type:type, metadata:{} }).then(()=>{})
}

export default function PublicProfile({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = use(params)
  const [profile, setProfile] = useState<Profile|null>(null)
  const [avail, setAvail]     = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selDate, setSelDate] = useState<string|null>(null)
  const [selTime, setSelTime] = useState<string|null>(null)
  const [taken, setTaken]     = useState<string[]>([])
  const [step, setStep]       = useState<'pick'|'form'|'done'>('pick')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [notes, setNotes]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [theme, setTheme]     = useState({ primary:T.sage, dark:T.dark, glow:T.sageG, pale:T.sageP, light:T.sageL })

  const THEMES: Record<string,typeof theme> = {
    sage:       { primary:'#7A9E87', dark:'#2C3530', glow:'#EAF3EC', pale:'#D6E8DA', light:'#A8C4AD' },
    ocean:      { primary:'#4A7FA5', dark:'#1E3A4F', glow:'#E8F4FB', pale:'#C5DEEC', light:'#7AAECA' },
    rose:       { primary:'#C4788A', dark:'#4A2430', glow:'#FAF0F2', pale:'#EDD5DB', light:'#D9A0AE' },
    lavender:   { primary:'#8A7AB5', dark:'#2E2448', glow:'#F2F0FA', pale:'#DAD5EC', light:'#B0A5D0' },
    terracotta: { primary:'#C47A5A', dark:'#4A2818', glow:'#FAF0EB', pale:'#EDD5C5', light:'#D9A080' },
    mint:       { primary:'#5AA58A', dark:'#1A3D30', glow:'#E8F8F2', pale:'#C5E5D8', light:'#80C4A8' },
    gold:       { primary:'#B8963E', dark:'#3D2E10', glow:'#FBF5E0', pale:'#EDD98C', light:'#D4B468' },
    slate:      { primary:'#607B8B', dark:'#1E2E38', glow:'#EBF1F5', pale:'#C8D8E0', light:'#8FA5B3' },
  }

  useEffect(() => {
    supabase.from('profiles').select('*').eq('slug', slug).single().then(({ data: p }) => {
      if (!p) { setNotFound(true); setLoading(false); return }
      setProfile(p)
      const tc = (p as any).theme_color
      if (tc && THEMES[tc]) setTheme(THEMES[tc])
      supabase.from('availability').select('*').eq('professional_id', p.id).eq('active', true).then(({ data }) => setAvail(data||[]))
      setLoading(false)
      trackEvent(p.id, 'page_view')
    })
  }, [slug])

  useEffect(() => {
    if (!profile || !selDate) return
    supabase.from('appointments').select('appt_time').eq('professional_id', profile.id).eq('appt_date', selDate).in('status', ['pending','confirmed']).then(({ data }) => setTaken((data||[]).map(a=>a.appt_time.slice(0,5))))
  }, [profile, selDate])

  const weekDates = Array.from({length:14}).map((_,i)=>addDays(new Date(),i)).filter(d=>avail.some(a=>a.day_of_week===d.getDay()))
  const dayAvail  = selDate ? avail.find(a=>a.day_of_week===new Date(selDate+'T12:00').getDay()) : null
  const slots     = dayAvail ? genSlots(dayAvail.start_time, dayAvail.end_time, dayAvail.slot_minutes) : []
  const th = theme

  async function handleBook(e: React.FormEvent) {
    e.preventDefault()
    if (!profile||!selDate||!selTime) return
    setSubmitting(true)
    const { data: appt, error } = await supabase.from('appointments').insert({
      professional_id:profile.id, client_name:clientName, client_phone:clientPhone,
      client_email:clientEmail||null, notes:notes||null,
      appt_date:selDate, appt_time:selTime+':00',
    }).select().single()
    if (!error && appt) {
      trackEvent(profile.id, 'booking_completed')
      if (profile.whatsapp) {
        fetch('/api/whatsapp', { method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ appointment_id:appt.id, professional_phone:profile.whatsapp, professional_name:profile.name, client_name:clientName, client_phone:clientPhone, appt_date:selDate, appt_time:selTime }) })
      }
      if (clientEmail) {
        fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ type:'confirmation', to:clientEmail, client:clientName, professional:profile.name, date:selDate, time:selTime }) })
      }
      setStep('done')
    }
    setSubmitting(false)
  }

  function FI({ label, value, set, placeholder, type='text', required=false }: any) {
    const [f,setF] = useState(false)
    return (
      <div style={{ marginBottom:14 }}>
        <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>{label}</label>
        <input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} required={required}
          style={{ width:'100%', padding:'12px 16px', fontSize:14, color:T.dark, background:T.off, border:`2px solid ${f?th.primary:T.nude}`, borderRadius:T.r12, outline:'none', fontFamily:T.fontSans, transition:'border-color 0.2s' }}
          onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
      </div>
    )
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:T.off, fontFamily:T.fontSans }}>
      <GlobalStyles/>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:T.fontSerif, fontSize:24, color:T.dark, marginBottom:12 }}>Organiza<span style={{ color:T.sage }}>+</span></div>
        <div style={{ width:24, height:24, border:`3px solid ${T.sageP}`, borderTopColor:T.sage, borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto' }}/>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:T.off, fontFamily:T.fontSans, textAlign:'center', padding:24 }}>
      <GlobalStyles/>
      <div>
        <p style={{ fontSize:52, marginBottom:16 }}>🔍</p>
        <h1 style={{ fontFamily:T.fontSerif, fontSize:32, color:T.dark, marginBottom:8 }}>Página não encontrada</h1>
        <p style={{ color:T.muted }}>Este profissional não existe ou o link está incorreto.</p>
      </div>
    </div>
  )

  if (!profile) return null

  return (
    <div style={{ minHeight:'100vh', background:T.off, fontFamily:T.fontSans }}>
      <GlobalStyles/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Hero header */}
      <div style={{ background:`linear-gradient(135deg, ${th.dark} 0%, ${th.dark}ee 100%)`, padding:'40px 24px 36px' }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>
          <div style={{ width:88, height:88, borderRadius:'50%', background:th.pale, border:`4px solid rgba(255,255,255,0.15)`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:18, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
            {profile.photo_url ? <img src={profile.photo_url} alt={profile.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👩‍⚕️'}
          </div>
          <h1 style={{ fontFamily:T.fontSerif, fontSize:'clamp(22px,5vw,32px)', color:'#FAFAF7', margin:'0 0 6px' }}>{profile.name}</h1>
          <p style={{ fontSize:14, color:th.light, margin:'0 0 6px', fontWeight:500 }}>{profile.profession}{profile.crm_cro_crp?` — ${profile.crm_cro_crp}`:''}</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:14, marginTop:10 }}>
            {profile.city && <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:'rgba(255,255,255,0.45)' }}><MapPin size={12}/>{profile.city}{profile.state?`, ${profile.state}`:''}</span>}
            {profile.online    && <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:'rgba(255,255,255,0.45)' }}><Monitor size={12}/>Online</span>}
            {profile.in_person && <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:'rgba(255,255,255,0.45)' }}><Heart size={12}/>Presencial</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'24px 24px 60px' }}>

        {/* Specialties */}
        {profile.specialties?.length ? (
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
            {profile.specialties.map(s => (
              <span key={s} style={{ background:th.glow, border:`1px solid ${th.pale}`, color:th.primary, fontSize:12, fontWeight:600, padding:'5px 13px', borderRadius:T.r100 }}>{s}</span>
            ))}
          </div>
        ) : null}

        {/* Bio */}
        {profile.bio && (
          <div style={{ background:T.white, borderRadius:T.r20, padding:'20px 22px', boxShadow:T.shadowCard, marginBottom:18 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:T.dark, marginBottom:8 }}>Sobre</h2>
            <p style={{ fontSize:14, color:T.mid, lineHeight:1.7, margin:0 }}>{profile.bio}</p>
          </div>
        )}

        {/* BOOKING */}
        <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden', marginBottom:14 }}>
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.nude}`, display:'flex', alignItems:'center', gap:8 }}>
            <Clock size={15} style={{ color:th.primary }}/>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:18, color:T.dark, margin:0 }}>Agendar consulta</h2>
          </div>

          {step==='done' && (
            <div style={{ padding:'48px 24px', textAlign:'center', animation:'fadeIn 0.4s ease' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:th.glow, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, margin:'0 auto 16px' }}>✅</div>
              <h3 style={{ fontFamily:T.fontSerif, fontSize:24, color:T.dark, marginBottom:8 }}>Agendamento realizado!</h3>
              <p style={{ fontSize:14, color:T.muted, marginBottom:4 }}>📅 {selDate} às {selTime}</p>
              {clientEmail && <p style={{ fontSize:13, color:T.muted }}>Confirmação enviada para <strong>{clientEmail}</strong></p>}
              <button onClick={()=>{setStep('pick');setSelDate(null);setSelTime(null);setClientName('');setClientPhone('');setClientEmail('');setNotes('')}}
                style={{ marginTop:20, color:th.primary, fontSize:14, fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:T.fontSans }}>
                Fazer outro agendamento →
              </button>
            </div>
          )}

          {step==='form' && (
            <form onSubmit={handleBook} style={{ padding:'20px', animation:'fadeIn 0.3s ease' }}>
              <div style={{ background:th.glow, borderRadius:T.r12, padding:'12px 16px', marginBottom:20, fontSize:13, fontWeight:600, color:th.primary, display:'flex', alignItems:'center', gap:8 }}>
                📅 {selDate} às {selTime}
              </div>
              <FI label="Seu nome *" value={clientName} set={setClientName} placeholder="Nome completo" required/>
              <FI label="Telefone / WhatsApp *" value={clientPhone} set={setClientPhone} placeholder="(11) 99999-9999" required/>
              <FI label="E-mail (receba confirmação)" value={clientEmail} set={setClientEmail} placeholder="seu@email.com" type="email"/>
              <FI label="Observações (opcional)" value={notes} set={setNotes} placeholder="Alguma informação importante..."/>
              <div style={{ display:'flex', gap:10, marginTop:6 }}>
                <button type="button" onClick={()=>setStep('pick')}
                  style={{ padding:'13px 16px', border:`2px solid ${T.nude}`, background:'transparent', color:T.dark, borderRadius:T.r12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:T.fontSans }}>
                  ← Voltar
                </button>
                <button type="submit" disabled={submitting}
                  style={{ flex:1, padding:'13px', background:submitting?T.muted:th.dark, color:'#FAFAF7', border:'none', borderRadius:T.r12, fontSize:14, fontWeight:700, cursor:submitting?'not-allowed':'pointer', fontFamily:T.fontSans, transition:'background 0.2s' }}>
                  {submitting ? 'Agendando...' : 'Confirmar agendamento →'}
                </button>
              </div>
            </form>
          )}

          {step==='pick' && (
            <div style={{ padding:'20px' }}>
              {weekDates.length===0 ? (
                <p style={{ textAlign:'center', color:T.muted, fontSize:14, padding:'32px 0' }}>Nenhum horário disponível no momento.</p>
              ) : (
                <>
                  <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Escolha uma data</p>
                  <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:22 }}>
                    {weekDates.map(d => {
                      const ds = format(d,'yyyy-MM-dd')
                      const sel = selDate===ds
                      return (
                        <button key={ds} type="button" onClick={()=>{setSelDate(ds);setSelTime(null)}}
                          style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 14px', borderRadius:T.r14, border:`2px solid ${sel?th.primary:T.nude}`, background:sel?th.primary:T.white, color:sel?'#fff':T.dark, cursor:'pointer', fontFamily:T.fontSans, transition:'all 0.15s', minWidth:58, boxShadow:sel?`0 4px 12px ${th.primary}33`:'none' }}>
                          <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', opacity:0.8 }}>{format(d,'EEE',{locale:ptBR})}</span>
                          <span style={{ fontSize:22, fontWeight:800, lineHeight:1.2 }}>{format(d,'dd')}</span>
                          <span style={{ fontSize:10, opacity:0.7 }}>{format(d,'MMM',{locale:ptBR})}</span>
                        </button>
                      )
                    })}
                  </div>

                  {selDate && (
                    <>
                      <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Horários disponíveis</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                        {slots.map(s => {
                          const isTaken = taken.includes(s)
                          const isSel   = selTime===s
                          return (
                            <button key={s} type="button" disabled={isTaken} onClick={()=>setSelTime(s)}
                              style={{ padding:'9px 16px', borderRadius:T.r12, border:`2px solid ${isTaken?T.nude:isSel?th.primary:T.nude}`, background:isTaken?T.off:isSel?th.primary:T.white, color:isTaken?T.muted:isSel?'#fff':T.dark, fontSize:14, fontWeight:600, cursor:isTaken?'not-allowed':'pointer', fontFamily:T.fontSans, transition:'all 0.15s', opacity:isTaken?0.4:1, boxShadow:isSel?`0 4px 12px ${th.primary}44`:'none' }}>
                              {s}{isTaken&&' ✗'}
                            </button>
                          )
                        })}
                      </div>
                      {selTime && (
                        <button type="button" onClick={()=>{trackEvent(profile!.id,'booking_started');setStep('form')}}
                          style={{ width:'100%', padding:'15px', background:th.dark, color:'#FAFAF7', border:'none', borderRadius:T.r14, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:T.fontSans, transition:'background 0.2s' }}
                          onMouseEnter={e=>e.currentTarget.style.background=th.primary}
                          onMouseLeave={e=>e.currentTarget.style.background=th.dark}>
                          Continuar → {selTime}
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* WhatsApp button */}
        {profile.whatsapp && (
          <button type="button" onClick={()=>{ trackEvent(profile!.id,'whatsapp_click'); window.open(`https://wa.me/55${profile!.whatsapp!.replace(/\D/g,'')}`) }}
            style={{ width:'100%', padding:'16px', background:'#25D366', color:'white', border:'none', borderRadius:T.r20, fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontFamily:T.fontSans, boxShadow:'0 4px 16px rgba(37,211,102,0.25)', transition:'all 0.2s', marginBottom:24 }}
            onMouseEnter={e=>e.currentTarget.style.background='#22c55e'}
            onMouseLeave={e=>e.currentTarget.style.background='#25D366'}>
            <Phone size={18}/> Falar pelo WhatsApp
          </button>
        )}

        <p style={{ textAlign:'center', fontSize:12, color:T.muted }}>
          Powered by <span style={{ fontWeight:700, color:T.sage }}>Organiza+</span>
        </p>
      </div>
    </div>
  )
}
