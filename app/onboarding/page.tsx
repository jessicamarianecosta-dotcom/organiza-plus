'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { T, GlobalStyles } from '@/lib/ds'
import DynamicSpecialties from '@/lib/DynamicSpecialties'
import ScheduleConfig, { defaultWeek, weekConfigToRows, WeekConfig, BlockedSlot } from '@/lib/ScheduleConfig'
import { Upload, Clock, Globe, Sparkles, ArrowRight, Check, ChevronRight } from 'lucide-react'

// ─── DATA ──────────────────────────────────────────────────────────────────
const PROFESSIONS = [
  { label:'Psicólogo(a)', icon:'🧠' }, { label:'Psiquiatra',     icon:'💊' },
  { label:'Nutricionista', icon:'🥗' }, { label:'Fisioterapeuta', icon:'💆' },
  { label:'Médico(a)',     icon:'⚕️' }, { label:'Dentista',       icon:'🦷' },
  { label:'Esteticista',  icon:'🌸' }, { label:'Terapeuta',      icon:'🧘' },
  { label:'Coach',        icon:'🎯' }, { label:'Educador Físico',icon:'🏃' },
  { label:'Outro',        icon:'✦'  },
]

const THEMES = [
  { id:'sage',       name:'Verde Sage',    desc:'Saúde e calma',        primary:'#7A9E87', dark:'#2C3530', glow:'#EAF3EC', pale:'#D6E8DA', light:'#A8C4AD' },
  { id:'ocean',      name:'Azul Oceano',   desc:'Confiança',            primary:'#4A7FA5', dark:'#1E3A4F', glow:'#E8F4FB', pale:'#C5DEEC', light:'#7AAECA' },
  { id:'rose',       name:'Rosa Suave',    desc:'Acolhimento',          primary:'#C4788A', dark:'#4A2430', glow:'#FAF0F2', pale:'#EDD5DB', light:'#D9A0AE' },
  { id:'lavender',   name:'Lavanda',       desc:'Equilíbrio',           primary:'#8A7AB5', dark:'#2E2448', glow:'#F2F0FA', pale:'#DAD5EC', light:'#B0A5D0' },
  { id:'terracotta', name:'Terracota',     desc:'Vitalidade',           primary:'#C47A5A', dark:'#4A2818', glow:'#FAF0EB', pale:'#EDD5C5', light:'#D9A080' },
  { id:'mint',       name:'Menta',         desc:'Bem-estar',            primary:'#5AA58A', dark:'#1A3D30', glow:'#E8F8F2', pale:'#C5E5D8', light:'#80C4A8' },
  { id:'gold',       name:'Dourado',       desc:'Sofisticação',         primary:'#B8963E', dark:'#3D2E10', glow:'#FBF5E0', pale:'#EDD98C', light:'#D4B468' },
  { id:'slate',      name:'Ardósia',       desc:'Profissionalismo',     primary:'#607B8B', dark:'#1E2E38', glow:'#EBF1F5', pale:'#C8D8E0', light:'#8FA5B3' },
]

const DAYS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

const STEPS = [
  { n:1, icon:'🎯', label:'Profissão' },
  { n:2, icon:'🎨', label:'Visual' },
  { n:3, icon:'👤', label:'Perfil' },
  { n:4, icon:'📅', label:'Horários' },
  { n:5, icon:'🌐', label:'Prévia' },
  { n:6, icon:'✨', label:'Pronto' },
]

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,50) || `pro-${Date.now()}`
}

// ─── MICRO COMPONENTS ──────────────────────────────────────────────────────
function FI({ label, value, set, placeholder, req=false, type='text', maxLen }: any) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>{label}</label>}
      <input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} required={req} maxLength={maxLen}
        style={{ width:'100%', padding:'12px 16px', fontSize:14, color:T.dark, background:T.off, border:`2px solid ${f?T.sage:T.nude}`, borderRadius:T.r12, outline:'none', fontFamily:T.fontSans, transition:'border-color 0.2s' }}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
    </div>
  )
}

function FTA({ label, value, set, placeholder, rows=4 }: any) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>{label}</label>}
      <textarea rows={rows} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} maxLength={500}
        style={{ width:'100%', padding:'12px 16px', fontSize:14, color:T.dark, background:T.off, border:`2px solid ${f?T.sage:T.nude}`, borderRadius:T.r12, outline:'none', fontFamily:T.fontSans, transition:'border-color 0.2s', resize:'vertical' }}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
    </div>
  )
}

function PrimaryBtn({ children, onClick, disabled, loading, style }: any) {
  const [h, setH] = useState(false)
  return (
    <button type={onClick?'button':'submit'} onClick={onClick} disabled={disabled||loading}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'15px', fontSize:15, fontWeight:700, color:T.cream, background:h&&!(disabled||loading)?T.sage:T.dark, border:'none', borderRadius:T.r14, cursor:(disabled||loading)?'not-allowed':'pointer', fontFamily:T.fontSans, transition:'background 0.2s', opacity:(disabled||loading)?0.45:1, ...style }}>
      {loading ? <span style={{ width:18, height:18, border:`2px solid ${T.cream}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/> : null}
      {children}
    </button>
  )
}

function SecBtn({ children, onClick }: any) {
  const [h, setH] = useState(false)
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ padding:'15px 20px', fontSize:14, fontWeight:600, color:T.dark, background:h?T.sageG:'transparent', border:`2px solid ${h?T.sageL:T.nude}`, borderRadius:T.r14, cursor:'pointer', fontFamily:T.fontSans, transition:'all 0.15s' }}>
      {children}
    </button>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function Onboarding() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [pid, setPid] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [mounted, setMounted] = useState(false)

  // Step 1
  const [profession, setProfession]             = useState('')
  const [customProfession, setCustomProfession] = useState('')
  const [specs, setSpecs] = useState<string[]>([])
  const [online, setOnline] = useState(false)
  const [inPerson, setInPerson] = useState(true)

  // Step 2 — theme
  const [theme, setTheme] = useState(THEMES[0])

  // Step 3 — profile
  const [name, setName] = useState('')
  const [crm, setCrm] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [instagram, setInstagram] = useState('')
  const [bio, setBio] = useState('')

  // Step 4 — advanced schedule
  const [weekConfig, setWeekConfig] = useState<WeekConfig>(defaultWeek())
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data: p }) => {
        if (!p) { router.push('/cadastro'); return }
        if ((p as any).onboarding_done) { router.push('/dashboard'); return }
        setPid(p.id); setSlug((p as any).slug || '')
        setName(p.name || ''); setBio(p.bio || '')
        setWhatsapp(p.whatsapp || ''); setCity(p.city || '')
        setState(p.state || ''); setCrm(p.crm_cro_crp || '')
        setInstagram((p as any).instagram || ''); setPhotoUrl(p.photo_url || '')
        setProfession(p.profession || ''); setSpecs(p.specialties || [])
        const saved = THEMES.find(t => t.id === (p as any).theme_color)
        if (saved) setTheme(saved)
      })
    })
  }, [router])


  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method:'POST', body:fd })
    const { url } = await res.json()
    if (url) setPhotoUrl(url)
    setUploading(false)
  }

  async function saveStep1() {
    const finalProf = profession === 'Outro' ? (customProfession.trim() || 'Outro') : profession
    setSaving(true)
    await supabase.from('profiles').update({ profession:finalProf, specialties:specs, online, in_person:inPerson }).eq('id', pid)
    setSaving(false); setStep(2)
  }

  async function saveStep2() {
    setSaving(true)
    await supabase.from('profiles').update({ theme_color: theme.id } as any).eq('id', pid)
    setSaving(false); setStep(3)
  }

  async function saveStep3() {
    if (!name.trim()) return
    setSaving(true)
    let finalSlug = slug || slugify(name)
    const { data: ex } = await supabase.from('profiles').select('slug').eq('slug', finalSlug).neq('id', pid)
    if (ex && ex.length > 0) finalSlug = `${finalSlug}-${Math.random().toString(36).slice(2,5)}`
    setSlug(finalSlug)
    await supabase.from('profiles').update({ name, slug:finalSlug, bio, whatsapp, city, state, crm_cro_crp:crm, instagram }).eq('id', pid)
    setSaving(false); setStep(4)
  }

  async function saveStep4() {
    setSaving(true)
    // Save availability rows with full config
    await supabase.from('availability').delete().eq('professional_id', pid)
    const rows = weekConfigToRows(pid, weekConfig)
    if (rows.length > 0) {
      await supabase.from('availability').insert(rows)
    }
    // Save blocked slots
    if (blockedSlots.length > 0) {
      await supabase.from('blocked_slots').delete().eq('professional_id', pid)
      await supabase.from('blocked_slots').insert(
        blockedSlots.map(b => ({
          professional_id: pid,
          blocked_date: b.date,
          all_day: b.allDay,
          start_time: b.startTime || null,
          end_time: b.endTime || null,
          reason: b.reason || null,
        }))
      )
    }
    setSaving(false); setStep(5)
  }

  async function finish() {
    setSaving(true)
    await supabase.from('profiles').update({ onboarding_done: true } as any).eq('id', pid)
    setSaving(false); setStep(6)
  }

  const th = theme
  const progress = Math.round(((step-1)/(STEPS.length-1))*100)

  if (!mounted) return <div style={{ minHeight:'100vh', background:T.off }}><GlobalStyles/></div>

  return (
    <div style={{ minHeight:'100vh', background:T.off, fontFamily:T.fontSans, color:T.dark }}>
      <GlobalStyles/>

      {/* ── TOP BAR ── */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:`rgba(247,245,240,0.92)`, backdropFilter:'blur(16px)', borderBottom:`1px solid ${T.nude}`, padding:'0 24px' }}>
        <div style={{ maxWidth:680, margin:'0 auto', padding:'14px 0' }}>
          {/* Logo + step counter */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:T.sage }}/>
              <span style={{ fontFamily:T.fontSerif, fontSize:18, color:T.dark }}>Organiza<span style={{ color:T.sage }}>+</span></span>
            </div>
            <span style={{ fontSize:13, color:T.muted, fontWeight:600 }}>Passo {step} de {STEPS.length}</span>
          </div>

          {/* Progress bar */}
          <div style={{ height:4, background:T.nude, borderRadius:4, overflow:'hidden', marginBottom:10 }}>
            <div style={{ height:'100%', borderRadius:4, transition:'width 0.4s ease', background:th.primary, width:`${progress}%` }}/>
          </div>

          {/* Step dots */}
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, transition:'all 0.2s', background: step>s.n ? th.primary : step===s.n ? T.dark : T.nude, color: step>=s.n ? T.cream : T.muted }}>
                  {step>s.n ? '✓' : s.icon}
                </div>
                <span style={{ fontSize:9, fontWeight:600, color:step===s.n?T.dark:T.muted, display:'none' }} className="step-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 24px 80px' }}>

        {/* STEP 1 — PROFISSÃO */}
        {step===1 && (
          <div style={{ animation:'fadeIn 0.4s ease' }}>
            <h1 style={{ fontFamily:T.fontSerif, fontSize:'clamp(28px,5vw,42px)', color:T.dark, margin:'0 0 8px' }}>
              Qual é a sua profissão? 🎯
            </h1>
            <p style={{ fontSize:15, color:T.muted, marginBottom:28 }}>Isso define como sua página aparece para os clientes.</p>

            {/* Profession grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:24 }}>
              {PROFESSIONS.map(p => (
                <button key={p.label} type="button" onClick={()=>{setProfession(p.label); setSpecs([])}}
                  style={{ padding:'14px 12px', borderRadius:T.r14, border:`2px solid ${profession===p.label?th.primary:T.nude}`, background:profession===p.label?th.glow:T.white, color:profession===p.label?th.primary:T.mid, fontFamily:T.fontSans, fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'left', transition:'all 0.15s', display:'flex', alignItems:'center', gap:8, boxShadow:profession===p.label?`0 0 0 3px ${th.pale}`:'none' }}>
                  <span style={{ fontSize:20 }}>{p.icon}</span>
                  <span>{p.label}</span>
                  {profession===p.label && <span style={{ marginLeft:'auto', color:th.primary, fontSize:12 }}>✓</span>}
                </button>
              ))}
            </div>

            {/* Custom profession input */}
            {profession === 'Outro' && (
              <div style={{ background:T.white, borderRadius:T.r16, padding:'16px 18px', boxShadow:T.shadowCard, marginBottom:16 }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.dark, marginBottom:8 }}>Qual é a sua profissão? *</p>
                <FI value={customProfession} set={setCustomProfession} placeholder="Ex: Biomédico, Quiropraxista, Advogado, Fonoaudiólogo..."/>
              </div>
            )}

            {/* Specialties */}
            {/* Dynamic specialties with custom add */}
            <div style={{ background:T.white, borderRadius:T.r16, padding:'18px', boxShadow:T.shadowCard, marginBottom:20 }}>
              <p style={{ fontSize:13, fontWeight:700, color:T.dark, marginBottom:14 }}>
                Especialidades <span style={{ color:T.muted, fontWeight:400 }}>(selecione e adicione as suas)</span>
              </p>
              <DynamicSpecialties
                profession={profession}
                value={specs}
                onChange={setSpecs}
                theme={th}
              />
            </div>

            {/* Tipo de atendimento */}
            <div style={{ background:T.white, borderRadius:T.r16, padding:'18px', boxShadow:T.shadowCard, marginBottom:28 }}>
              <p style={{ fontSize:13, fontWeight:700, color:T.dark, marginBottom:12 }}>Tipo de atendimento</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[{label:'🏥 Presencial',val:inPerson,set:setInPerson},{label:'💻 Online',val:online,set:setOnline}].map(btn=>(
                  <button key={btn.label} type="button" onClick={()=>btn.set(!btn.val)}
                    style={{ padding:'13px', borderRadius:T.r12, border:`2px solid ${btn.val?th.primary:T.nude}`, background:btn.val?th.glow:T.off, color:btn.val?th.primary:T.muted, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:T.fontSans, transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {btn.val && <span style={{ fontSize:11 }}>✓</span>}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <PrimaryBtn onClick={saveStep1} disabled={!profession || (profession==='Outro' && !customProfession.trim())} loading={saving}>
              Continuar <ChevronRight size={18}/>
            </PrimaryBtn>
          </div>
        )}

        {/* STEP 2 — TEMA */}
        {step===2 && (
          <div style={{ animation:'fadeIn 0.4s ease' }}>
            <h1 style={{ fontFamily:T.fontSerif, fontSize:'clamp(28px,5vw,42px)', color:T.dark, margin:'0 0 8px' }}>
              Escolha as cores 🎨
            </h1>
            <p style={{ fontSize:15, color:T.muted, marginBottom:28 }}>Sua identidade visual. Pode mudar quando quiser.</p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
              {THEMES.map(t => (
                <button key={t.id} type="button" onClick={()=>setTheme(t)}
                  style={{ padding:'16px', borderRadius:T.r16, border:`2px solid ${theme.id===t.id?t.primary:T.nude}`, background:theme.id===t.id?t.glow:T.white, cursor:'pointer', textAlign:'left', transition:'all 0.15s', position:'relative', boxShadow:theme.id===t.id?`0 0 0 3px ${t.pale}`:'none', fontFamily:T.fontSans }}>
                  {/* Color swatches */}
                  <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                    {[t.primary, t.dark, t.glow].map((c,i) => (
                      <div key={i} style={{ width:i===0?26:18, height:i===0?26:18, borderRadius:'50%', background:c, boxShadow:'0 1px 4px rgba(0,0,0,0.1)', flexShrink:0 }}/>
                    ))}
                  </div>
                  <p style={{ fontWeight:700, fontSize:13, color:T.dark, margin:'0 0 2px' }}>{t.name}</p>
                  <p style={{ fontSize:11, color:T.muted, margin:0 }}>{t.desc}</p>
                  {theme.id===t.id && (
                    <div style={{ position:'absolute', top:10, right:10, width:20, height:20, borderRadius:'50%', background:t.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ color:'white', fontSize:11, fontWeight:700 }}>✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Live preview */}
            <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden', marginBottom:28 }}>
              <div style={{ padding:'6px 16px 4px', background:T.nude, borderBottom:`1px solid ${T.nude}` }}>
                <span style={{ fontSize:11, color:T.muted, fontWeight:600 }}>Prévia da sua página</span>
              </div>
              <div>
                <div style={{ padding:'20px', background:`linear-gradient(135deg, ${th.dark} 0%, ${th.dark}cc 100%)` }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:th.pale, border:'2px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:10 }}>
                    {photoUrl ? <img src={photoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }}/> : '👤'}
                  </div>
                  <p style={{ fontFamily:T.fontSerif, fontSize:18, color:T.cream, margin:'0 0 2px' }}>{name || 'Seu nome'}</p>
                  <p style={{ fontSize:12, color:th.light, margin:0, fontWeight:500 }}>{profession || 'Profissão'}</p>
                </div>
                <div style={{ padding:'14px 20px' }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                    {(specs.slice(0,3)).map(s => (
                      <span key={s} style={{ background:th.glow, border:`1px solid ${th.pale}`, color:th.primary, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:T.r100 }}>{s}</span>
                    ))}
                    {!specs.length && ['Especialidade 1','Especialidade 2'].map(s => (
                      <span key={s} style={{ background:th.glow, border:`1px solid ${th.pale}`, color:th.primary, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:T.r100 }}>{s}</span>
                    ))}
                  </div>
                  <button style={{ width:'100%', padding:'11px', background:th.dark, color:T.cream, border:'none', borderRadius:T.r12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:T.fontSans }}>
                    Agendar consulta →
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <SecBtn onClick={()=>setStep(1)}>← Voltar</SecBtn>
              <div style={{ flex:1 }}><PrimaryBtn onClick={saveStep2} loading={saving}>Continuar <ChevronRight size={18}/></PrimaryBtn></div>
            </div>
          </div>
        )}

        {/* STEP 3 — PERFIL */}
        {step===3 && (
          <div style={{ animation:'fadeIn 0.4s ease' }}>
            <h1 style={{ fontFamily:T.fontSerif, fontSize:'clamp(28px,5vw,42px)', color:T.dark, margin:'0 0 8px' }}>
              Seu perfil 👤
            </h1>
            <p style={{ fontSize:15, color:T.muted, marginBottom:28 }}>Essas informações aparecem na sua página pública.</p>

            {/* Photo upload */}
            <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:22, marginBottom:20, display:'flex', alignItems:'center', gap:18 }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:T.sageG, border:`3px solid ${T.sageP}`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, flexShrink:0 }}>
                {photoUrl ? <img src={photoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👤'}
              </div>
              <div>
                <p style={{ fontWeight:700, color:T.dark, fontSize:14, marginBottom:4 }}>Foto de perfil</p>
                <p style={{ fontSize:12, color:T.muted, marginBottom:10 }}>Uma foto profissional aumenta muito a confiança.</p>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto}/>
                <button type="button" onClick={()=>fileRef.current?.click()} disabled={uploading}
                  style={{ display:'flex', alignItems:'center', gap:7, background:th.glow, border:`1px solid ${th.pale}`, color:th.primary, borderRadius:T.r12, padding:'8px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:T.fontSans }}>
                  <Upload size={13}/> {uploading ? 'Enviando...' : 'Adicionar foto'}
                </button>
              </div>
            </div>

            <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:22, marginBottom:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FI label="Nome completo *" value={name} set={setName} placeholder="Dra. Ana Beatriz Silva" req/>
                <FI label="Registro (CRM/CRP/CRO)" value={crm} set={setCrm} placeholder="CRP 06/12345"/>
                <FI label="WhatsApp" value={whatsapp} set={setWhatsapp} placeholder="(11) 99999-9999"/>
                <FI label="Instagram" value={instagram} set={setInstagram} placeholder="@usuario"/>
                <FI label="Cidade" value={city} set={setCity} placeholder="São Paulo"/>
                <FI label="Estado" value={state} set={setState} placeholder="SP" maxLen={2}/>
              </div>
              <FTA label="Bio (apresentação para os clientes)" value={bio} set={setBio} placeholder="Especializada em TCC com 8 anos de experiência..." rows={3}/>
              <p style={{ fontSize:11, color:T.muted, textAlign:'right', marginTop:-8 }}>{bio.length}/500</p>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <SecBtn onClick={()=>setStep(2)}>← Voltar</SecBtn>
              <div style={{ flex:1 }}><PrimaryBtn onClick={saveStep3} disabled={!name.trim()} loading={saving}>Continuar <ChevronRight size={18}/></PrimaryBtn></div>
            </div>
          </div>
        )}

        {/* STEP 4 — HORÁRIOS AVANÇADOS */}
        {step===4 && (
          <div style={{ animation:'fadeIn 0.4s ease' }}>
            <h1 style={{ fontFamily:T.fontSerif, fontSize:'clamp(28px,5vw,42px)', color:T.dark, margin:'0 0 8px' }}>
              Horários de atendimento 📅
            </h1>
            <p style={{ fontSize:15, color:T.muted, marginBottom:24 }}>
              Configure seus dias, duração das consultas, intervalo de almoço e bloqueios.
            </p>

            <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:'20px', marginBottom:16 }}>
              <ScheduleConfig
                value={weekConfig}
                onChange={setWeekConfig}
                blocked={blockedSlots}
                onBlockedChange={setBlockedSlots}
                theme={{ primary:th.primary, glow:th.glow, pale:th.pale }}
                showBlocked={true}
              />
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <SecBtn onClick={()=>setStep(3)}>← Voltar</SecBtn>
              <div style={{ flex:1 }}><PrimaryBtn onClick={saveStep4} loading={saving}>Continuar <ChevronRight size={18}/></PrimaryBtn></div>
            </div>
          </div>
        )}

        {/* STEP 5 — PRÉVIA */}
        {step===5 && (
          <div style={{ animation:'fadeIn 0.4s ease' }}>
            <h1 style={{ fontFamily:T.fontSerif, fontSize:'clamp(28px,5vw,42px)', color:T.dark, margin:'0 0 8px' }}>
              Sua página está pronta! 🌐
            </h1>
            <p style={{ fontSize:15, color:T.muted, marginBottom:28 }}>Veja como os clientes vão te encontrar.</p>

            {/* Link */}
            <div style={{ background:T.white, borderRadius:T.r16, boxShadow:T.shadowCard, padding:'16px 20px', marginBottom:16 }}>
              <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Seu link público</p>
              <div style={{ display:'flex', alignItems:'center', gap:10, background:th.glow, borderRadius:T.r12, padding:'11px 14px' }}>
                <Globe size={15} style={{ color:th.primary, flexShrink:0 }}/>
                <span style={{ fontSize:13, fontWeight:600, color:T.dark, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  organiza-plus-five.vercel.app/p/{slug}
                </span>
                <button type="button" onClick={()=>navigator.clipboard.writeText(`https://organiza-plus-five.vercel.app/p/${slug}`)}
                  style={{ background:th.primary, color:T.cream, border:'none', borderRadius:T.r10, padding:'5px 12px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:T.fontSans, flexShrink:0 }}>
                  Copiar
                </button>
              </div>
            </div>

            {/* Profile card preview */}
            <div style={{ background:T.white, borderRadius:T.r24, boxShadow:T.shadowXl, overflow:'hidden', marginBottom:24 }}>
              <div style={{ padding:'24px 22px 18px', background:`linear-gradient(135deg, ${th.dark} 0%, ${th.dark}dd 100%)` }}>
                <div style={{ width:60, height:60, borderRadius:'50%', background:th.pale, border:'2px solid rgba(255,255,255,0.2)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:12 }}>
                  {photoUrl ? <img src={photoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👤'}
                </div>
                <p style={{ fontFamily:T.fontSerif, fontSize:20, color:T.cream, margin:'0 0 3px' }}>{name || 'Seu nome'}</p>
                <p style={{ fontSize:13, color:th.light, margin:'0 0 3px', fontWeight:500 }}>{profession}{crm ? ` — ${crm}` : ''}</p>
                {city && <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', margin:0 }}>📍 {city}{state ? `, ${state}` : ''}</p>}
              </div>
              <div style={{ padding:'18px 22px' }}>
                {specs.length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:14 }}>
                    {specs.slice(0,4).map(s => (
                      <span key={s} style={{ background:th.glow, border:`1px solid ${th.pale}`, color:th.primary, fontSize:11, fontWeight:600, padding:'4px 11px', borderRadius:T.r100 }}>{s}</span>
                    ))}
                  </div>
                )}
                {bio && <p style={{ fontSize:13, color:T.mid, lineHeight:1.6, marginBottom:16 }}>{bio.slice(0,120)}{bio.length>120?'...':''}</p>}
                <div style={{ display:'flex', gap:8 }}>
                  <button style={{ flex:1, padding:'12px', background:th.dark, color:T.cream, border:'none', borderRadius:T.r12, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:T.fontSans }}>Agendar consulta →</button>
                  <button style={{ background:'#25D366', color:'white', border:'none', borderRadius:T.r12, padding:'12px 14px', fontSize:18, cursor:'pointer' }}>✉</button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div style={{ background:T.white, borderRadius:T.r16, boxShadow:T.shadowCard, padding:'18px 20px', marginBottom:24 }}>
              <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:12, display:'flex', alignItems:'center', gap:7 }}>
                <Sparkles size={15} style={{ color:th.primary }}/> Dicas para atrair mais clientes
              </p>
              {['Coloque o link na bio do Instagram e WhatsApp','Adicione uma foto profissional de qualidade','Complete sua bio com seus diferenciais','Compartilhe com pacientes antigos'].map(tip => (
                <div key={tip} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, fontSize:13, color:T.mid }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:th.glow, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:10, color:th.primary, fontWeight:700 }}>✓</span>
                  </div>
                  {tip}
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <SecBtn onClick={()=>setStep(4)}>← Voltar</SecBtn>
              <div style={{ flex:1 }}>
                <PrimaryBtn onClick={finish} loading={saving} style={{ background:th.primary }}>
                  Ir para o painel <ArrowRight size={18}/>
                </PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 — CONCLUÍDO */}
        {step===6 && (
          <div style={{ animation:'fadeIn 0.5s ease', textAlign:'center', paddingTop:20 }}>
            <div style={{ width:96, height:96, borderRadius:'50%', background:th.glow, border:`2px solid ${th.pale}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:48, margin:'0 auto 24px' }}>✨</div>
            <h1 style={{ fontFamily:T.fontSerif, fontSize:'clamp(32px,5vw,48px)', color:T.dark, margin:'0 0 10px' }}>Tudo pronto!</h1>
            <p style={{ fontSize:16, color:T.muted, marginBottom:6 }}>Sua página profissional está no ar.</p>
            <p style={{ fontSize:14, color:T.muted, marginBottom:32 }}>Já pode receber agendamentos automaticamente.</p>

            {/* Tema badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:th.glow, border:`1px solid ${th.pale}`, borderRadius:T.r100, padding:'7px 16px', marginBottom:32, fontSize:13, fontWeight:600, color:th.primary }}>
              <div style={{ width:14, height:14, borderRadius:'50%', background:th.primary }}/>
              Tema {th.name} aplicado
            </div>

            {/* Action cards */}
            <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:'18px', marginBottom:20, textAlign:'left' }}>
              <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Próximos passos</p>
              {[
                { icon:'📱', label:'Copie o link e cole no Instagram', action:()=>navigator.clipboard.writeText(`https://organiza-plus-five.vercel.app/p/${slug}`) },
                { icon:'💬', label:'Envie para pacientes via WhatsApp', action:()=>window.open(`https://wa.me/?text=${encodeURIComponent(`Agora você pode agendar comigo online! https://organiza-plus-five.vercel.app/p/${slug}`)}`) },
                { icon:'📊', label:'Explore o painel de gestão', action:()=>router.push('/dashboard') },
              ].map((item,i) => (
                <button key={i} type="button" onClick={item.action}
                  style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'13px 14px', borderRadius:T.r14, border:`1px solid ${T.nude}`, background:T.off, marginBottom:8, cursor:'pointer', fontFamily:T.fontSans, textAlign:'left', transition:'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=th.primary;e.currentTarget.style.background=th.glow}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.nude;e.currentTarget.style.background=T.off}}>
                  <span style={{ fontSize:22 }}>{item.icon}</span>
                  <span style={{ flex:1, fontSize:14, fontWeight:600, color:T.dark }}>{item.label}</span>
                  <ChevronRight size={16} style={{ color:T.muted }}/>
                </button>
              ))}
            </div>

            <PrimaryBtn onClick={()=>router.push('/dashboard')}>
              Acessar meu painel <ArrowRight size={18}/>
            </PrimaryBtn>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @media(min-width:640px){ .step-label { display:block!important; } }
      `}</style>
    </div>
  )
}
