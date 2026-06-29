'use client'
import { useState, useEffect, use, useRef } from 'react'
import { supabase, Profile, Availability } from '@/lib/supabase'
import { T, GlobalStyles } from '@/lib/ds'
import { getTemplate } from '@/lib/templates'
import { MapPin, Clock, Monitor, Heart, Phone, ArrowRight, Check } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── WhatsApp SVG icon ──────────────────────────────────────────────────────
function WppIcon({ size=20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  )
}

// ── Theme map ──────────────────────────────────────────────────────────────
const THEMES: Record<string,{primary:string,dark:string,glow:string,pale:string,light:string,mid:string}> = {
  sage:       { primary:'#7A9E87', dark:'#2C3530', glow:'#EAF3EC', pale:'#D6E8DA', light:'#A8C4AD', mid:'#4A7360' },
  ocean:      { primary:'#4A7FA5', dark:'#1E3A4F', glow:'#E8F4FB', pale:'#C5DEEC', light:'#7AAECA', mid:'#2E5F80' },
  rose:       { primary:'#C4788A', dark:'#4A2430', glow:'#FAF0F2', pale:'#EDD5DB', light:'#D9A0AE', mid:'#9E5265' },
  lavender:   { primary:'#8A7AB5', dark:'#2E2448', glow:'#F2F0FA', pale:'#DAD5EC', light:'#B0A5D0', mid:'#6A5A95' },
  terracotta: { primary:'#C47A5A', dark:'#4A2818', glow:'#FAF0EB', pale:'#EDD5C5', light:'#D9A080', mid:'#9E5A3A' },
  mint:       { primary:'#5AA58A', dark:'#1A3D30', glow:'#E8F8F2', pale:'#C5E5D8', light:'#80C4A8', mid:'#3A856A' },
  gold:       { primary:'#B8963E', dark:'#3D2E10', glow:'#FBF5E0', pale:'#EDD98C', light:'#D4B468', mid:'#987620' },
  slate:      { primary:'#607B8B', dark:'#1E2E38', glow:'#EBF1F5', pale:'#C8D8E0', light:'#8FA5B3', mid:'#405B6B' },
}

// ── Slot generator ─────────────────────────────────────────────────────────
function genSlots(start:string, end:string, mins:number) {
  const slots: string[] = []
  let [h,m] = start.split(':').map(Number)
  const [eh,em] = end.split(':').map(Number)
  while (h < eh || (h===eh && m < em)) {
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    m += mins; if (m>=60) { h+=Math.floor(m/60); m=m%60 }
  }
  return slots
}

async function track(pid:string, type:string) {
  supabase.from('analytics_events').insert({ professional_id:pid, event_type:type, metadata:{} }).then(()=>{})
}

// ── Specialty icons ────────────────────────────────────────────────────────
const SPEC_ICONS: Record<string,string> = {
  'Ansiedade':'🌿','Depressão':'💙','TCC':'🧠','Psicanálise':'📖',
  'Relacionamentos':'💑','Autoconhecimento':'🔍','TDAH':'✨','Trauma':'🌱',
  'Psicologia Infantil':'🌟','TOC':'🔄','Luto':'🕊️','Fobia':'🛡️','Fobias':'🛡️',
  'Síndrome do Pânico':'🌬️','Burnout':'🔋','Insônia':'🌙',
  'Autoestima':'💛','Bem-estar':'🌸','Inteligência Emocional':'💡',
  'Desenvolvimento Pessoal':'🌱','Equilíbrio Emocional':'⚖️','Motivação':'🔥',
  'Saúde Mental':'🧠','Prevenção':'🛡️','Qualidade de Vida':'🌟','Longevidade':'⏳',
  'Transtorno Bipolar':'🔵','Esquizofrenia':'🌀','Dependência Química':'🧪',
  'Transtorno de Personalidade':'🧬','Avaliação Diagnóstica':'📋',
  'Emagrecimento':'⚖️','Hipertrofia':'💪','Diabetes':'🩸','Vegano/Vegetariano':'🥗',
  'Alimentação Esportiva':'🏃','Nutrição Funcional':'🥦','Saúde Intestinal':'🫁',
  'Gestação':'🤱','Oncológica':'🎗️','Infantil':'👶','Reeducação Alimentar':'🍽️',
  'Ortopedia':'🦴','Neurológica':'🧠','Pós-operatório':'🏥','Pilates':'🤸',
  'RPG':'🧘','Estética':'✨','Respiratória':'🫁','Pediatria':'👶',
  'Geriatria':'👴','Dor Crônica':'💊','Reabilitação':'🔄',
  'Prevenção de Lesões':'🛡️','Equilíbrio Postural':'⚖️',
  'Clínica Geral':'⚕️','Cardiologia':'❤️','Dermatologia':'🌸','Endocrinologia':'🧬',
  'Ginecologia':'🌺','Saúde Preventiva':'🛡️','Check-up':'📋','Doenças Crônicas':'💊',
  'Ortodontia':'🦷','Implante':'🔩','Endodontia':'🔬','Periodontia':'🌿',
  'Odontopediatria':'👶','Harmonização Facial':'✨','Prótese':'🦷',
  'Estética Dental':'💎','Saúde Bucal':'🦷','Sorriso Harmonioso':'😊',
  'Limpeza de Pele':'🫧','Facial':'🌸','Corporal':'💆','Drenagem':'🌊',
  'Massagem':'🤲','Microagulhamento':'💉','Depilação':'✨','Laser':'⚡',
  'Peeling':'🌟','Radiofrequência':'📡','Rejuvenescimento':'✨','Relaxamento':'😌',
  'Reiki':'✋','Acupuntura':'🪡','Constelação Familiar':'👨‍👩‍👧',
  'Hipnoterapia':'🌀','Aromaterapia':'🌺','Meditação':'🧘',
  'Barras de Access':'🤲','Thetahealing':'🌟','Terapia Holística':'🌿',
  'Equilíbrio Energético':'⚡','Espiritualidade':'🌙',
  'Life Coaching':'🎯','Executive Coaching':'💼','Carreira':'📈',
  'Financeiro':'💰','Liderança':'👑','Alta Performance':'⚡',
  'Propósito':'🌟','Mindset':'🧠','Propósito de Vida':'🌟','Tomada de Decisão':'🎲',
  'Personal Trainer':'💪','Musculação':'🏋️','Funcional':'⚡',
  'Cardio':'🏃','CrossFit':'🔥','Esportes':'⚽','Natação':'🏊',
  'Performance':'🏆','Condicionamento Físico':'🏅',
  'Consultoria':'💼','Atendimento Personalizado':'🤝','Excelência':'⭐',
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PublicProfile({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = use(params)
  const bookRef  = useRef<HTMLDivElement>(null)

  const [profile, setProfile]   = useState<Profile|null>(null)
  const [avail, setAvail]       = useState<Availability[]>([])
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [th, setTh]             = useState(THEMES.sage)
  const [tmpl, setTmpl]         = useState<ReturnType<typeof getTemplate>|null>(null)

  const [selDate, setSelDate]   = useState<string|null>(null)
  const [selTime, setSelTime]   = useState<string|null>(null)
  const [taken, setTaken]       = useState<string[]>([])
  const [step, setStep]         = useState<'pick'|'form'|'done'>('pick')
  const [clientName, setCN]     = useState('')
  const [clientPhone, setCP]    = useState('')
  const [clientEmail, setCE]    = useState('')
  const [notes, setNotes]       = useState('')
  const [submitting, setSub]    = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    supabase.from('profiles').select('*').eq('slug', slug).single().then(({ data: p }) => {
      if (!p) { setNotFound(true); setLoading(false); return }
      setProfile(p)
      const tc = (p as any).theme_color
      if (tc && THEMES[tc]) setTh(THEMES[tc])
      setTmpl(getTemplate(p.profession || ''))
      supabase.from('availability').select('*').eq('professional_id', p.id).eq('active', true).then(({ data }) => setAvail(data||[]))
      setLoading(false)
      track(p.id, 'page_view')
    })
  }, [slug])

  useEffect(() => {
    if (!profile || !selDate) return
    supabase.from('appointments').select('appt_time')
      .eq('professional_id', profile.id).eq('appt_date', selDate)
      .in('status', ['pending','confirmed'])
      .then(({ data }) => setTaken((data||[]).map(a=>a.appt_time.slice(0,5))))
  }, [profile, selDate])

  function scrollToBook() {
    bookRef.current?.scrollIntoView({ behavior:'smooth', block:'start' })
  }

  const weekDates = Array.from({length:21}).map((_,i)=>addDays(new Date(),i))
    .filter(d=>avail.some(a=>a.day_of_week===d.getDay()))
  const dayAvail = selDate ? avail.find(a=>a.day_of_week===new Date(selDate+'T12:00').getDay()) : null
  const slots    = dayAvail ? genSlots(dayAvail.start_time, dayAvail.end_time, dayAvail.slot_minutes) : []

  async function handleBook(e: React.FormEvent) {
    e.preventDefault()
    if (!profile||!selDate||!selTime) return
    setSub(true)
    const { data: appt, error } = await supabase.from('appointments').insert({
      professional_id:profile.id, client_name:clientName, client_phone:clientPhone,
      client_email:clientEmail||null, notes:notes||null,
      appt_date:selDate, appt_time:selTime+':00',
    }).select().single()
    if (!error && appt) {
      track(profile.id, 'booking_completed')
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
    setSub(false)
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:'100vh', background:T.cream, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.fontSans }}>
      <GlobalStyles/>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:T.fontSerif, fontSize:26, color:T.dark, marginBottom:14 }}>Organiza<span style={{ color:T.sage }}>+</span></div>
        <div style={{ width:28, height:28, border:`3px solid ${T.sageP}`, borderTopColor:T.sage, borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto' }}/>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:T.cream, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.fontSans, textAlign:'center', padding:24 }}>
      <GlobalStyles/>
      <div>
        <div style={{ fontSize:60, marginBottom:16 }}>🔍</div>
        <h1 style={{ fontFamily:T.fontSerif, fontSize:32, color:T.dark, marginBottom:8 }}>Página não encontrada</h1>
        <p style={{ color:T.muted, fontSize:16 }}>Este profissional não existe ou o link está incorreto.</p>
      </div>
    </div>
  )

  if (!profile) return null

  const wppLink = profile.whatsapp ? `https://wa.me/55${profile.whatsapp.replace(/\D/g,'')}` : null

  return (
    <div style={{ minHeight:'100vh', background:T.cream, fontFamily:T.fontSans, color:T.dark }}>
      <GlobalStyles/>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeUp{ from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }
        input::placeholder, textarea::placeholder { color: #8A9690; }
        * { box-sizing: border-box; }

        /* Nav CTA — smaller on mobile */
        .nav-cta { padding: 9px 20px; font-size: 13px; }
        @media (max-width: 480px) { .nav-cta { padding: 7px 14px; font-size: 11px; } }

        /* Specs grid */
        .specs-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 600px) { .specs-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; } }
        @media (max-width: 380px) { .specs-grid { grid-template-columns: 1fr 1fr !important; } }

        /* Section grids */
        @media (max-width: 768px) {
          .about-grid  { grid-template-columns: 1fr !important; gap: 28px !important; }
          .diff-grid   { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
        }
        @media (max-width: 560px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }

        /* No horizontal overflow */
        body, html { overflow-x: hidden; max-width: 100vw; }
        img { max-width: 100%; }
      `}</style>

      {/* ── STICKY NAV ───────────────────────────────────────────────────── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        padding:'0 clamp(16px,4vw,24px)', height:60,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background: scrolled ? 'rgba(250,250,247,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${T.nude}` : 'none',
        boxShadow: scrolled ? T.shadowSm : 'none',
        transition:'all 0.3s ease',
      }}>
        <span style={{ fontFamily:T.fontSerif, fontSize:'clamp(14px,3vw,16px)', color: scrolled ? T.dark : '#FAFAF7', transition:'color 0.3s', whiteSpace:'nowrap' }}>
          Organiza<span style={{ color:th.primary }}>+</span>
        </span>
        <button onClick={scrollToBook} className="nav-cta"
          style={{ background:th.primary, color:'#FAFAF7', borderRadius:T.r100, fontWeight:700, border:'none', cursor:'pointer', fontFamily:T.fontSans, boxShadow:`0 4px 14px ${th.primary}44`, transition:'all 0.2s', whiteSpace:'nowrap' }}
          onMouseEnter={e=>{e.currentTarget.style.background=th.mid;e.currentTarget.style.transform='translateY(-1px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background=th.primary;e.currentTarget.style.transform='translateY(0)'}}>
          {tmpl?.hero.cta || 'Agendar consulta'}
        </button>
      </nav>

      {/* ── HERO: banner + circular avatar ───────────────────────────────── */}
      <section style={{
        background:`linear-gradient(160deg, ${th.dark} 0%, ${th.dark}f0 55%, ${th.primary}30 100%)`,
        position:'relative', overflow:'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-120, right:-120, width:500, height:500, borderRadius:'50%', background:`${th.primary}12`, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, left:-80, width:300, height:300, borderRadius:'50%', background:`${th.primary}08`, pointerEvents:'none' }}/>

        {/* Cover banner */}
        <div style={{ height:'clamp(200px,28vw,260px)', position:'relative', overflow:'hidden' }}>
          {profile.photo_url ? (
            <img src={profile.photo_url} alt="" aria-hidden="true" loading="lazy" decoding="async"
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 20%', filter:'brightness(0.38) blur(1px)', display:'block' }}/>
          ) : (
            <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg, ${th.primary}35 0%, ${th.dark} 100%)` }}/>
          )}
        </div>

        {/* Profile content — centered column */}
        <div className="fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', marginTop:-64, position:'relative', zIndex:2, padding:'0 clamp(16px,5vw,32px) clamp(48px,8vw,80px)' }}>

          {/* Circular avatar */}
          <div style={{
            width:'clamp(108px,20vw,132px)', height:'clamp(108px,20vw,132px)',
            borderRadius:'50%', overflow:'hidden', flexShrink:0,
            border:`5px solid ${th.dark}`,
            boxShadow:`0 0 0 3px rgba(255,255,255,0.18), 0 16px 48px rgba(0,0,0,0.6)`,
            background:th.pale, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44,
          }}>
            {profile.photo_url
              ? <img src={profile.photo_url} alt={profile.name} loading="lazy" decoding="async"
                  style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
              : <span>👩‍⚕️</span>}
          </div>

          {/* Name card */}
          <div style={{
            background:'rgba(255,255,255,0.08)', backdropFilter:'blur(16px)',
            border:'1px solid rgba(255,255,255,0.12)',
            borderRadius:T.r16, padding:'clamp(14px,2.5vw,18px) clamp(22px,5vw,36px)',
            textAlign:'center', marginTop:18,
            maxWidth:'min(360px, 88vw)', width:'fit-content',
          }}>
            <p style={{ fontFamily:T.fontSerif, fontSize:'clamp(18px,4.5vw,22px)', color:'#FAFAF7', margin:'0 0 4px', letterSpacing:'-0.01em' }}>{profile.name}</p>
            <p style={{ fontSize:'clamp(11px,2.5vw,13px)', color:'rgba(255,255,255,0.55)', margin:0 }}>
              {profile.profession}{profile.crm_cro_crp?` · ${profile.crm_cro_crp}`:''}
            </p>
          </div>

          {/* Location / mode badges */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:22 }}>
            {profile.city && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.75)', fontSize:12, fontWeight:500, padding:'5px 12px', borderRadius:T.r100, border:'1px solid rgba(255,255,255,0.15)' }}>
                <MapPin size={11}/> {profile.city}{profile.state?`, ${profile.state}`:''}
              </span>
            )}
            {profile.online && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.75)', fontSize:12, fontWeight:500, padding:'5px 12px', borderRadius:T.r100, border:'1px solid rgba(255,255,255,0.15)' }}>
                <Monitor size={11}/> Online
              </span>
            )}
            {profile.in_person && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.75)', fontSize:12, fontWeight:500, padding:'5px 12px', borderRadius:T.r100, border:'1px solid rgba(255,255,255,0.15)' }}>
                <Heart size={11}/> Presencial
              </span>
            )}
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily:T.fontSerif, fontSize:'clamp(30px,5vw,54px)', color:'#FAFAF7', lineHeight:1.1, margin:'36px 0 22px', letterSpacing:'-0.02em', textAlign:'center', maxWidth:700 }}>
            {tmpl?.hero.headline || 'Um atendimento profissional pensado para você.'}
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize:'clamp(15px,2.2vw,18px)', color:'rgba(255,255,255,0.6)', lineHeight:1.75, margin:'0 0 38px', maxWidth:520, textAlign:'center' }}>
            {tmpl?.hero.sub || 'Conecte-se com seus clientes de forma moderna, profissional e acolhedora.'}
          </p>

          {/* CTA buttons */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center', marginBottom:22 }}>
            <button onClick={scrollToBook} style={{
              display:'flex', alignItems:'center', gap:10,
              background:th.primary, color:'#FAFAF7',
              padding:'clamp(13px,2.5vw,16px) clamp(24px,5vw,36px)',
              borderRadius:T.r14, fontSize:'clamp(14px,2.5vw,16px)', fontWeight:700,
              border:'none', cursor:'pointer', fontFamily:T.fontSans,
              boxShadow:`0 8px 24px ${th.primary}55`, transition:'all 0.2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 12px 32px ${th.primary}66`}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=`0 8px 24px ${th.primary}55`}}>
              {tmpl?.hero.cta || 'Agendar consulta'} <ArrowRight size={17}/>
            </button>
            {wppLink && (
              <a href={wppLink} target="_blank" rel="noopener" onClick={()=>track(profile!.id,'whatsapp_click')} style={{
                display:'flex', alignItems:'center', gap:10,
                background:'#25D366', color:'#fff',
                padding:'clamp(13px,2.5vw,16px) clamp(18px,4vw,28px)',
                borderRadius:T.r14, fontSize:'clamp(14px,2.5vw,16px)', fontWeight:700,
                textDecoration:'none', fontFamily:T.fontSans, transition:'all 0.2s',
                boxShadow:'0 8px 24px rgba(37,211,102,0.35)',
              }}
                onMouseEnter={e=>{e.currentTarget.style.background='#1ebe5d';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(37,211,102,0.5)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='#25D366';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 8px 24px rgba(37,211,102,0.35)'}}>
                <WppIcon size={18}/> WhatsApp
              </a>
            )}
          </div>

          {/* Trust strip */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 16px', justifyContent:'center', alignItems:'center', marginBottom:48 }}>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:500 }}>⭐ 4,9/5 de satisfação</span>
            <span style={{ color:'rgba(255,255,255,0.2)', fontSize:14, lineHeight:1 }}>·</span>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:500 }}>🔒 Atendimento com privacidade</span>
            <span style={{ color:'rgba(255,255,255,0.2)', fontSize:14, lineHeight:1 }}>·</span>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:500 }}>📅 Agendamento em menos de 1 minuto</span>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:32, flexWrap:'wrap', justifyContent:'center' }}>
            {[
              { n:'8+', label:'Anos de experiência' },
              { n:'500+', label:'Pacientes atendidos' },
              { n:'100%', label:'Comprometimento' },
            ].map(s => (
              <div key={s.n} style={{ textAlign:'center' }}>
                <p style={{ fontFamily:T.fontSerif, fontSize:28, color:th.light, margin:0, lineHeight:1 }}>{s.n}</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', margin:'4px 0 0', fontWeight:500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, color:'rgba(255,255,255,0.3)', cursor:'pointer', paddingBottom:32 }} onClick={scrollToBook}>
          <span style={{ fontSize:11, fontWeight:500 }}>Role para ver mais</span>
          <div style={{ width:1, height:32, background:'rgba(255,255,255,0.2)' }}/>
        </div>
      </section>

      {/* ── EMOTIONAL QUOTE ────────────────────────────────────────────────── */}
      <section style={{ padding:'48px 24px', background:th.glow, borderTop:`1px solid ${th.pale}`, borderBottom:`1px solid ${th.pale}`, textAlign:'center' }}>
        <p style={{ fontFamily:T.fontSerif, fontSize:'clamp(18px,3vw,26px)', color:th.dark, fontStyle:'italic', maxWidth:640, margin:'0 auto' }}>
          "{tmpl?.quote || 'Cuidar de si mesmo é o primeiro passo para uma vida plena.'}"
        </p>
      </section>

      {/* ── SOBRE MIM ──────────────────────────────────────────────────────── */}
      {profile.bio && (
        <section style={{ padding:'clamp(48px,8vw,96px) clamp(16px,5vw,24px)', background:T.cream }}>
          <div className="about-grid" style={{ maxWidth:1080, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center' }}>
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:th.glow, border:`1px solid ${th.pale}`, borderRadius:T.r100, padding:'5px 14px', fontSize:12, fontWeight:700, color:th.primary, marginBottom:20 }}>
                <Heart size={12}/> Sobre mim
              </div>
              <h2 style={{ fontFamily:T.fontSerif, fontSize:'clamp(26px,4vw,40px)', color:T.dark, margin:'0 0 20px', lineHeight:1.15 }}>
                {tmpl?.about.title || 'Sobre mim'}
              </h2>
              <p style={{ fontSize:16, color:T.mid, lineHeight:1.85, marginBottom:28 }}>{profile.bio}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {(tmpl?.about.values || [
                  'Atendimento personalizado e cuidadoso',
                  'Foco nos seus objetivos',
                  'Experiência e qualificação',
                  'Acompanhamento contínuo',
                ]).map(v => (
                  <div key={v} style={{ display:'flex', alignItems:'center', gap:12, fontSize:14, color:T.mid, fontWeight:500 }}>
                    <div style={{ width:22, height:22, borderRadius:'50%', background:th.glow, border:`1px solid ${th.pale}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Check size={11} color={th.primary} strokeWidth={3}/>
                    </div>
                    {v}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position:'relative' }}>
              <div style={{ background:`linear-gradient(135deg, ${th.dark} 0%, ${th.dark}e0 100%)`, borderRadius:T.r24, padding:'36px', boxShadow:T.shadowXl, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-40, right:-40, width:180, height:180, borderRadius:'50%', background:`${th.primary}18` }}/>
                <div style={{ position:'absolute', bottom:-30, left:-30, width:120, height:120, borderRadius:'50%', background:`${th.primary}12` }}/>
                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ width:56, height:56, borderRadius:T.r16, background:`${th.primary}30`, border:`1px solid ${th.primary}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:20 }}>🎓</div>
                  <h3 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.cream, margin:'0 0 12px' }}>Formação & Abordagem</h3>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.7, margin:'0 0 20px' }}>
                    {profile.profession} com foco em abordagem humanizada e baseada em ciência.
                  </p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {(profile.specialties||[]).slice(0,4).map(s => (
                      <span key={s} style={{ background:`${th.primary}25`, color:th.light, fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:T.r100, border:`1px solid ${th.primary}35` }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ position:'absolute', bottom:-20, right:-20, background:T.white, borderRadius:T.r16, padding:'14px 18px', boxShadow:T.shadowLg, display:'flex', alignItems:'center', gap:10, border:`1px solid ${T.nude}` }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:th.glow, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>⭐</div>
                <div>
                  <p style={{ fontWeight:700, fontSize:13, color:T.dark, margin:0 }}>Atendimento</p>
                  <p style={{ fontSize:11, color:T.muted, margin:0 }}>de excelência</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ESPECIALIDADES ─────────────────────────────────────────────────── */}
      {((profile.specialties && profile.specialties.length > 0) || (tmpl?.defaultSpecs && tmpl.defaultSpecs.length > 0)) && (
        <section style={{ padding:'clamp(48px,8vw,96px) clamp(16px,5vw,24px)', background:T.off }}>
          <div style={{ maxWidth:1080, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:th.glow, border:`1px solid ${th.pale}`, borderRadius:T.r100, padding:'5px 14px', fontSize:12, fontWeight:700, color:th.primary, marginBottom:16 }}>
                🧠 Áreas de atuação
              </div>
              <h2 style={{ fontFamily:T.fontSerif, fontSize:'clamp(26px,4vw,40px)', color:T.dark, margin:'0 0 12px' }}>
                {tmpl?.specialties.title || 'Áreas de atuação'}
              </h2>
              <p style={{ fontSize:16, color:T.muted, maxWidth:500, margin:'0 auto' }}>
                {tmpl?.specialties.sub || 'Conheça as áreas em que ofereço atendimento especializado.'}
              </p>
            </div>
            {(() => {
              const EXTRAS = tmpl?.specialties.extras || ['Atendimento Personalizado','Acompanhamento','Desenvolvimento','Bem-estar','Qualidade de Vida','Excelência']
              const base = (profile.specialties && profile.specialties.length > 0) ? profile.specialties : (tmpl?.defaultSpecs || [])
              let filled = [...base]
              const remainder = filled.length % 3
              if (remainder !== 0) {
                const needed = 3 - remainder
                const pool = EXTRAS.filter(e => !filled.includes(e))
                filled = [...filled, ...pool.slice(0, needed)]
              }
              return (
                <div className="specs-grid" style={{ display:'grid', gap:12 }}>
                  {filled.map(s => (
                    <SpecCard key={s} label={s} icon={SPEC_ICONS[s]||'💚'} th={th}/>
                  ))}
                </div>
              )
            })()}
          </div>
        </section>
      )}

      {/* ── DIFERENCIAIS ───────────────────────────────────────────────────── */}
      <section style={{ padding:'96px 24px', background:T.cream }}>
        <div style={{ maxWidth:1080, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:th.glow, border:`1px solid ${th.pale}`, borderRadius:T.r100, padding:'5px 14px', fontSize:12, fontWeight:700, color:th.primary, marginBottom:16 }}>
              ✨ Por que me escolher
            </div>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:'clamp(26px,4vw,40px)', color:T.dark, margin:'0 0 12px' }}>
              Um espaço seguro para <em style={{ color:th.primary, fontStyle:'italic' }}>sua evolução</em>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {[
              { icon:'🫶', title:'Atendimento acolhedor', desc:'Um espaço de escuta genuína, sem julgamentos, onde você pode ser você mesmo.' },
              { icon:'🔬', title:'Baseado em ciência', desc:'Técnicas validadas cientificamente para promover seu bem-estar e saúde mental.' },
              { icon:'💻', title:'Online e presencial', desc:'Flexibilidade para você escolher o formato que funciona melhor para sua rotina.' },
              { icon:'🔒', title:'Ambiente sigiloso', desc:'Total confidencialidade. Tudo que você compartilha fica entre nós.' },
              { icon:'📈', title:'Evolução contínua', desc:'Acompanhamento personalizado com foco no seu crescimento e desenvolvimento.' },
              { icon:'⏰', title:'Pontualidade e respeito', desc:'Seu tempo é valioso. Sessões pontuais e totalmente dedicadas a você.' },
            ].map(d => (
              <DiffCard key={d.title} icon={d.icon} title={d.title} desc={d.desc} th={th}/>
            ))}
          </div>
        </div>
      </section>

      {/* ── EMOTIONAL QUOTE 2 ──────────────────────────────────────────────── */}
      <section style={{ padding:'72px 24px', background:`linear-gradient(135deg, ${th.dark} 0%, ${th.dark}f5 100%)`, textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:`${th.primary}15` }}/>
        <div style={{ position:'absolute', bottom:-40, left:-40, width:160, height:160, borderRadius:'50%', background:`${th.primary}10` }}/>
        <div style={{ maxWidth:680, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:36, marginBottom:16, animation:'float 3s ease-in-out infinite' }}>🌿</div>
          <p style={{ fontFamily:T.fontSerif, fontSize:'clamp(20px,3vw,32px)', color:T.cream, lineHeight:1.4, margin:'0 0 24px', fontStyle:'italic' }}>
            "{tmpl?.quote || 'Excelência é um compromisso com o cuidado genuíno.'}"
          </p>
          <button onClick={scrollToBook} style={{
            background:th.primary, color:'#FAFAF7', padding:'14px 32px',
            borderRadius:T.r100, fontSize:15, fontWeight:700, border:'none', cursor:'pointer',
            fontFamily:T.fontSans, boxShadow:`0 8px 24px ${th.primary}55`, transition:'all 0.2s',
          }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
            {tmpl?.hero.cta || 'Agendar minha consulta'} →
          </button>
        </div>
      </section>

      {/* ── AGENDAMENTO ────────────────────────────────────────────────────── */}
      <section id="agendar" ref={bookRef} style={{ padding:'clamp(48px,8vw,96px) clamp(16px,5vw,24px)', background:T.off, scrollMarginTop:60 }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:th.glow, border:`1px solid ${th.pale}`, borderRadius:T.r100, padding:'5px 14px', fontSize:12, fontWeight:700, color:th.primary, marginBottom:16 }}>
              <Clock size={12}/> Agendamento online
            </div>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:'clamp(26px,4vw,40px)', color:T.dark, margin:'0 0 10px' }}>
              Agende sua <em style={{ color:th.primary, fontStyle:'italic' }}>consulta</em>
            </h2>
            <p style={{ fontSize:15, color:T.muted }}>Simples, rápido e sem burocracia. Em menos de 2 minutos.</p>
          </div>

          <div style={{ background:T.white, borderRadius:T.r24, boxShadow:T.shadowXl, overflow:'hidden', border:`1px solid ${T.nude}` }}>
            {/* Steps indicator */}
            <div style={{ display:'flex', borderBottom:`1px solid ${T.nude}` }}>
              {[{n:1,label:'Data & Hora'},{n:2,label:'Seus dados'},{n:3,label:'Confirmado'}].map((s,i) => {
                const curr = step==='pick'?1 : step==='form'?2 : 3
                const done = curr > s.n
                const active = curr === s.n
                return (
                  <div key={s.n} style={{ flex:1, padding:'16px 12px', textAlign:'center', borderRight: i<2?`1px solid ${T.nude}`:'none', background:active?th.glow:'transparent', transition:'background 0.2s' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:done?th.primary:active?th.primary:'#EDE8E0', color:done||active?'#fff':T.muted, fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 6px', transition:'all 0.2s' }}>
                      {done ? '✓' : s.n}
                    </div>
                    <p style={{ fontSize:11, fontWeight:600, color:active?th.primary:T.muted, margin:0 }}>{s.label}</p>
                  </div>
                )
              })}
            </div>

            {/* DONE */}
            {step==='done' && (
              <div style={{ padding:'60px 32px', textAlign:'center' }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background:th.glow, border:`2px solid ${th.pale}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:38, margin:'0 auto 20px', animation:'float 2s ease-in-out infinite' }}>✅</div>
                <h3 style={{ fontFamily:T.fontSerif, fontSize:28, color:T.dark, margin:'0 0 10px' }}>Agendamento confirmado!</h3>
                <p style={{ fontSize:15, color:T.muted, marginBottom:6 }}>📅 <strong>{selDate}</strong> às <strong>{selTime}</strong></p>
                {clientEmail && <p style={{ fontSize:14, color:T.muted, marginBottom:28 }}>Confirmação enviada para <strong>{clientEmail}</strong></p>}
                <div style={{ background:th.glow, border:`1px solid ${th.pale}`, borderRadius:T.r16, padding:'16px 20px', maxWidth:360, margin:'0 auto 28px', fontSize:14, color:th.mid, lineHeight:1.6 }}>
                  {tmpl?.booking.confirmMsg || 'Em breve você receberá uma confirmação. Qualquer dúvida, fale pelo WhatsApp.'}
                </div>
                {wppLink && (
                  <a href={wppLink} target="_blank" rel="noopener" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#25D366', color:'white', padding:'13px 24px', borderRadius:T.r14, fontSize:14, fontWeight:700, textDecoration:'none' }}>
                    <WppIcon size={16}/> Falar no WhatsApp
                  </a>
                )}
                <br/>
                <button onClick={()=>{setStep('pick');setSelDate(null);setSelTime(null);setCN('');setCP('');setCE('');setNotes('')}}
                  style={{ marginTop:16, color:th.primary, fontSize:13, fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:T.fontSans }}>
                  Fazer outro agendamento →
                </button>
              </div>
            )}

            {/* FORM */}
            {step==='form' && (
              <form onSubmit={handleBook} style={{ padding:'32px' }}>
                <div style={{ background:th.glow, border:`1px solid ${th.pale}`, borderRadius:T.r14, padding:'13px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:10, fontSize:14, fontWeight:600, color:th.primary }}>
                  <Clock size={15}/> {selDate && format(new Date(selDate+'T12:00'),"EEEE, dd 'de' MMMM",{locale:ptBR})} às {selTime}
                </div>
                <div className="form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                  <BookInput label="Seu nome completo *" value={clientName} set={setCN} placeholder="Ana Carolina" required th={th}/>
                  <BookInput label="WhatsApp *" value={clientPhone} set={setCP} placeholder="(11) 99999-9999" required th={th}/>
                </div>
                <BookInput label="E-mail (para confirmação)" value={clientEmail} set={setCE} placeholder="seu@email.com" type="email" th={th}/>
                <BookInput label="Observações (opcional)" value={notes} set={setNotes} placeholder="Alguma informação importante que devo saber?" th={th} rows={3}/>
                <div style={{ display:'flex', gap:12, marginTop:8 }}>
                  <button type="button" onClick={()=>setStep('pick')}
                    style={{ padding:'14px 18px', border:`2px solid ${T.nude}`, background:'transparent', color:T.dark, borderRadius:T.r12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:T.fontSans, transition:'border-color 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=th.primary} onMouseLeave={e=>e.currentTarget.style.borderColor=T.nude}>
                    ← Voltar
                  </button>
                  <button type="submit" disabled={submitting}
                    style={{ flex:1, padding:'14px', background:submitting?T.muted:th.dark, color:'#FAFAF7', border:'none', borderRadius:T.r12, fontSize:15, fontWeight:700, cursor:submitting?'not-allowed':'pointer', fontFamily:T.fontSans, transition:'background 0.2s', boxShadow:`0 6px 20px ${th.dark}30` }}
                    onMouseEnter={e=>{if(!submitting)e.currentTarget.style.background=th.primary}}
                    onMouseLeave={e=>{if(!submitting)e.currentTarget.style.background=th.dark}}>
                    {submitting ? '⏳ Confirmando...' : '✓ Confirmar agendamento'}
                  </button>
                </div>
              </form>
            )}

            {/* PICK */}
            {step==='pick' && (
              <div style={{ padding:'32px' }}>
                {weekDates.length === 0 ? (
                  <div style={{ padding:'48px', textAlign:'center' }}>
                    <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
                    <h3 style={{ fontFamily:T.fontSerif, fontSize:22, color:T.dark, marginBottom:8 }}>Sem horários disponíveis</h3>
                    <p style={{ color:T.muted }}>Entre em contato pelo WhatsApp para agendar.</p>
                    {wppLink && <a href={wppLink} target="_blank" rel="noopener" style={{ display:'inline-block', marginTop:16, background:'#25D366', color:'white', padding:'12px 24px', borderRadius:T.r12, fontWeight:700, textDecoration:'none' }}>Falar no WhatsApp</a>}
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize:12, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Escolha uma data disponível</p>
                    <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:10, marginBottom:28 }}>
                      {weekDates.slice(0,14).map(d => {
                        const ds = format(d,'yyyy-MM-dd')
                        const sel = selDate===ds
                        return (
                          <button key={ds} type="button" onClick={()=>{setSelDate(ds);setSelTime(null)}}
                            style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 16px', borderRadius:T.r16, border:`2px solid ${sel?th.primary:T.nude}`, background:sel?th.primary:T.white, color:sel?'#fff':T.dark, cursor:'pointer', fontFamily:T.fontSans, transition:'all 0.15s', minWidth:64, boxShadow:sel?`0 4px 14px ${th.primary}44`:T.shadowSm }}>
                            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', opacity:0.8, marginBottom:4 }}>{format(d,'EEE',{locale:ptBR})}</span>
                            <span style={{ fontFamily:T.fontSerif, fontSize:24, lineHeight:1.1 }}>{format(d,'dd')}</span>
                            <span style={{ fontSize:10, opacity:0.7, marginTop:2 }}>{format(d,'MMM',{locale:ptBR})}</span>
                          </button>
                        )
                      })}
                    </div>

                    {selDate && (
                      <div style={{ animation:'fadeUp 0.3s ease' }}>
                        <p style={{ fontSize:12, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>
                          Horários disponíveis — {format(new Date(selDate+'T12:00'),'EEEE',{locale:ptBR})}
                        </p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:24 }}>
                          {slots.map(s => {
                            const isTaken = taken.includes(s)
                            const isSel   = selTime===s
                            return (
                              <button key={s} type="button" disabled={isTaken} onClick={()=>setSelTime(s)}
                                style={{ padding:'11px 18px', borderRadius:T.r12, border:`2px solid ${isTaken?T.nude:isSel?th.primary:T.nude}`, background:isTaken?T.off:isSel?th.primary:T.white, color:isTaken?T.muted:isSel?'#fff':T.dark, fontSize:14, fontWeight:600, cursor:isTaken?'not-allowed':'pointer', fontFamily:T.fontSans, transition:'all 0.15s', opacity:isTaken?0.4:1, boxShadow:isSel?`0 4px 14px ${th.primary}44`:T.shadowSm }}>
                                {s}{isTaken&&' ✗'}
                              </button>
                            )
                          })}
                        </div>
                        {selTime && (
                          <button type="button" onClick={()=>{track(profile!.id,'booking_started');setStep('form')}}
                            style={{ width:'100%', padding:'16px', background:th.dark, color:'#FAFAF7', border:'none', borderRadius:T.r14, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:T.fontSans, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.2s', boxShadow:`0 6px 20px ${th.dark}30` }}
                            onMouseEnter={e=>e.currentTarget.style.background=th.primary}
                            onMouseLeave={e=>e.currentTarget.style.background=th.dark}>
                            Continuar com {selTime} <ArrowRight size={18}/>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ background:th.dark, padding:'48px 24px 32px' }}>
        <div style={{ maxWidth:1080, margin:'0 auto' }}>
          <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:24, marginBottom:32 }}>
            <div>
              <p style={{ fontFamily:T.fontSerif, fontSize:20, color:T.cream, margin:'0 0 8px' }}>{profile.name}</p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', margin:'0 0 16px' }}>{profile.profession}{profile.crm_cro_crp?` · ${profile.crm_cro_crp}`:''}</p>
              {profile.city && <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:6 }}><MapPin size={12}/> {profile.city}{profile.state?`, ${profile.state}`:''}</p>}
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Atendimento</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {profile.online    && <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', margin:0, display:'flex', alignItems:'center', gap:6 }}><Monitor size={12}/> Online (via Google Meet)</p>}
                {profile.in_person && <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', margin:0, display:'flex', alignItems:'center', gap:6 }}><Heart size={12}/> Presencial</p>}
              </div>
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Contato</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {wppLink && (
                  <a href={wppLink} target="_blank" rel="noopener" style={{ display:'flex', alignItems:'center', gap:8, background:'#25D366', color:'white', padding:'10px 16px', borderRadius:T.r12, fontSize:13, fontWeight:600, textDecoration:'none', width:'fit-content' }}
                    onClick={()=>track(profile!.id,'whatsapp_click')}>
                    <WppIcon size={14}/> WhatsApp
                  </a>
                )}
                {(profile as any).instagram && (
                  <a href={`https://instagram.com/${(profile as any).instagram.replace('@','')}`} target="_blank" rel="noopener" style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,0.45)', fontSize:13, textDecoration:'none' }}>
                    📷 {(profile as any).instagram}
                  </a>
                )}
              </div>
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:24, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', margin:0 }}>© 2025 {profile.name}. Todos os direitos reservados.</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', margin:0 }}>
              Powered by <span style={{ fontWeight:700, color:th.primary }}>Organiza+</span>
            </p>
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLUTUANTE ─────────────────────────────────────────────── */}
      {wppLink && (
        <a href={wppLink} target="_blank" rel="noopener"
          onClick={()=>track(profile!.id,'whatsapp_click')}
          style={{ position:'fixed', bottom:28, right:28, zIndex:200, width:58, height:58, borderRadius:'50%', background:'#25D366', color:'white', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(37,211,102,0.45)', textDecoration:'none', transition:'transform 0.2s, box-shadow 0.2s', animation:'float 3s ease-in-out infinite' }}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.1)';e.currentTarget.style.boxShadow='0 12px 32px rgba(37,211,102,0.6)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 8px 24px rgba(37,211,102,0.45)'}}>
          <WppIcon size={28}/>
        </a>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────
function SpecCard({ label, icon, th }: { label:string, icon:string, th:any }) {
  const [h,setH] = useState(false)
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:h?th.glow:T.white, borderRadius:T.r16, padding:'18px 14px', border:`2px solid ${h?th.pale:T.nude}`, boxShadow:h?T.shadowMd:T.shadowCard, transition:'all 0.2s', cursor:'default', transform:h?'translateY(-3px)':'none', minWidth:0, wordBreak:'break-word' }}>
      <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
      <p style={{ fontWeight:700, fontSize:13, color:T.dark, margin:0, lineHeight:1.3 }}>{label}</p>
    </div>
  )
}

function DiffCard({ icon, title, desc, th }: { icon:string, title:string, desc:string, th:any }) {
  const [h,setH] = useState(false)
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:h?th.glow:T.white, borderRadius:T.r20, padding:'28px', border:`1px solid ${h?th.pale:T.nude}`, boxShadow:h?T.shadowMd:T.shadowCard, transition:'all 0.2s', transform:h?'translateY(-3px)':'none' }}>
      <div style={{ fontSize:30, marginBottom:16 }}>{icon}</div>
      <h3 style={{ fontWeight:700, fontSize:16, color:T.dark, marginBottom:8 }}>{title}</h3>
      <p style={{ fontSize:14, color:T.muted, lineHeight:1.65, margin:0 }}>{desc}</p>
    </div>
  )
}

function BookInput({ label, value, set, placeholder, required=false, type='text', rows, th }: { label:string, value:string, set:(v:string)=>void, placeholder?:string, required?:boolean, type?:string, rows?:number, th:any }) {
  const [f,setF] = useState(false)
  const style0 = { width:'100%', padding:'13px 16px', fontSize:14, color:T.dark, background:T.off, border:`2px solid ${f?th.primary:T.nude}`, borderRadius:T.r12, outline:'none', fontFamily:T.fontSans, transition:'border-color 0.2s', resize:(rows?'vertical':'none') as any }
  return (
    <div style={{ marginBottom:rows?0:0 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>{label}</label>
      {rows
        ? <textarea rows={rows} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} style={style0} onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
        : <input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} required={required} style={style0} onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
      }
    </div>
  )
}
