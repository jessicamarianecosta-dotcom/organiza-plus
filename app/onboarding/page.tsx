'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Check, ChevronRight, Upload, Clock, Globe, Sparkles, ArrowRight } from 'lucide-react'

const PROFESSIONS = ['Psicólogo(a)','Psiquiatra','Nutricionista','Fisioterapeuta','Médico(a)','Dentista','Esteticista','Terapeuta','Coach','Educador Físico','Outro']

const SPECIALTIES_BY_PROF: Record<string, string[]> = {
  'Psicólogo(a)':    ['Ansiedade','Depressão','TCC','Psicanálise','Relacionamentos','Autoconhecimento','TDAH','Trauma'],
  'Psiquiatra':      ['Transtorno Bipolar','Esquizofrenia','Depressão','Ansiedade','TOC','TDAH','Dependência Química'],
  'Nutricionista':   ['Emagrecimento','Hipertrofia','Vegano','Diabetes','Esportiva','Oncológica','Infantil'],
  'Fisioterapeuta':  ['Ortopédia','Neurológica','Respiratória','Pós-cirúrgico','Pilates','RPG','Estética'],
  'Médico(a)':       ['Clínica Geral','Cardiologia','Dermatologia','Endocrinologia','Ginecologia','Ortopedia'],
  'Dentista':        ['Clínica Geral','Ortodontia','Implante','Estética','Endodontia','Periodontia'],
  'Esteticista':     ['Facial','Corporal','Limpeza de Pele','Drenagem','Massagem','Depilação'],
  'Terapeuta':       ['Reiki','Acupuntura','Aromaterapia','Hipnose','Constelação Familiar','Meditação'],
  'Coach':           ['Life Coaching','Executive Coaching','Carreira','Relacionamentos','Financeiro','Emagrecimento'],
  'Educador Físico': ['Personal Trainer','Musculação','Funcional','Cardio','Natação','Crossfit'],
}

const DAYS_FULL = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

// ── PALETAS DE CORES ─────────────────────────────────────────────────────────
const THEMES = [
  {
    id: 'sage',
    name: 'Verde Sage',
    description: 'Calma e saúde',
    primary: '#7A9E87',
    light: '#A8C4AD',
    pale: '#D6E8DA',
    glow: '#EAF3EC',
    dark: '#2C3530',
    preview: ['#7A9E87', '#2C3530', '#EAF3EC'],
  },
  {
    id: 'ocean',
    name: 'Azul Oceano',
    description: 'Confiança e serenidade',
    primary: '#4A7FA5',
    light: '#7AAECA',
    pale: '#C5DEEC',
    glow: '#E8F4FB',
    dark: '#1E3A4F',
    preview: ['#4A7FA5', '#1E3A4F', '#E8F4FB'],
  },
  {
    id: 'rose',
    name: 'Rosa Suave',
    description: 'Acolhimento e cuidado',
    primary: '#C4788A',
    light: '#D9A0AE',
    pale: '#EDD5DB',
    glow: '#FAF0F2',
    dark: '#4A2430',
    preview: ['#C4788A', '#4A2430', '#FAF0F2'],
  },
  {
    id: 'lavender',
    name: 'Lavanda',
    description: 'Espiritualidade e equilíbrio',
    primary: '#8A7AB5',
    light: '#B0A5D0',
    pale: '#DAD5EC',
    glow: '#F2F0FA',
    dark: '#2E2448',
    preview: ['#8A7AB5', '#2E2448', '#F2F0FA'],
  },
  {
    id: 'terracotta',
    name: 'Terracota',
    description: 'Energia e vitalidade',
    primary: '#C47A5A',
    light: '#D9A080',
    pale: '#EDD5C5',
    glow: '#FAF0EB',
    dark: '#4A2818',
    preview: ['#C47A5A', '#4A2818', '#FAF0EB'],
  },
  {
    id: 'mint',
    name: 'Menta',
    description: 'Frescor e bem-estar',
    primary: '#5AA58A',
    light: '#80C4A8',
    pale: '#C5E5D8',
    glow: '#E8F8F2',
    dark: '#1A3D30',
    preview: ['#5AA58A', '#1A3D30', '#E8F8F2'],
  },
  {
    id: 'gold',
    name: 'Dourado',
    description: 'Sofisticação e premium',
    primary: '#B8963E',
    light: '#D4B468',
    pale: '#EDD98C',
    glow: '#FBF5E0',
    dark: '#3D2E10',
    preview: ['#B8963E', '#3D2E10', '#FBF5E0'],
  },
  {
    id: 'slate',
    name: 'Cinza Ardósia',
    description: 'Profissionalismo e seriedade',
    primary: '#607B8B',
    light: '#8FA5B3',
    pale: '#C8D8E0',
    glow: '#EBF1F5',
    dark: '#1E2E38',
    preview: ['#607B8B', '#1E2E38', '#EBF1F5'],
  },
]

type Avail = { day: number; start: string; end: string }
type Theme = typeof THEMES[0]

const STEPS = [
  { id: 1, label: 'Profissão',  icon: '🎯' },
  { id: 2, label: 'Visual',     icon: '🎨' },
  { id: 3, label: 'Perfil',     icon: '👤' },
  { id: 4, label: 'Horários',   icon: '📅' },
  { id: 5, label: 'Sua página', icon: '🌐' },
  { id: 6, label: 'Pronto!',    icon: '✨' },
]

export default function Onboarding() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep]           = useState(1)
  const [profileId, setProfileId] = useState('')
  const [slug, setSlug]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl]   = useState('')

  // Step 1
  const [profession, setProfession]       = useState('')
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([])
  const [atendOnline, setAtendOnline]     = useState(false)
  const [atendPresencial, setAtendPresencial] = useState(true)

  // Step 2 — Tema
  const [theme, setTheme] = useState<Theme>(THEMES[0])

  // Step 3
  const [name, setName]         = useState('')
  const [bio, setBio]           = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [city, setCity]         = useState('')
  const [stateBr, setStateBr]   = useState('')
  const [crm, setCrm]           = useState('')

  // Step 4
  const [avail, setAvail] = useState<Avail[]>([
    { day: 1, start: '08:00', end: '18:00' },
    { day: 2, start: '08:00', end: '18:00' },
    { day: 3, start: '08:00', end: '18:00' },
    { day: 4, start: '08:00', end: '18:00' },
    { day: 5, start: '08:00', end: '18:00' },
  ])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data: p }) => {
        if (!p) { router.push('/cadastro'); return }
        if ((p as any).onboarding_done) { router.push('/dashboard'); return }
        setProfileId(p.id); setSlug(p.slug || '')
        setName(p.name || ''); setBio(p.bio || '')
        setWhatsapp(p.whatsapp || ''); setCity(p.city || '')
        setStateBr(p.state || ''); setCrm(p.crm_cro_crp || '')
        setPhotoUrl(p.photo_url || ''); setProfession(p.profession || '')
        setSelectedSpecs(p.specialties || [])
        setAtendOnline(p.online || false); setAtendPresencial(p.in_person !== false)
        const saved = THEMES.find(t => t.id === (p as any).theme_color)
        if (saved) setTheme(saved)
      })
    })
  }, [router])

  function toggleSpec(s: string) {
    setSelectedSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }
  function toggleDay(d: number) {
    setAvail(prev => prev.some(a => a.day === d)
      ? prev.filter(a => a.day !== d)
      : [...prev, { day: d, start: '08:00', end: '18:00' }].sort((a,b)=>a.day-b.day))
  }
  function updateAvail(d: number, k: string, v: string) {
    setAvail(prev => prev.map(a => a.day === d ? {...a, [k]: v} : a))
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const { url } = await res.json()
    if (url) setPhotoUrl(url)
    setUploading(false)
  }

  async function saveStep1() {
    setSaving(true)
    await supabase.from('profiles').update({ profession, specialties: selectedSpecs, online: atendOnline, in_person: atendPresencial }).eq('id', profileId)
    setSaving(false); setStep(2)
  }

  async function saveStep2() {
    setSaving(true)
    await supabase.from('profiles').update({ theme_color: theme.id } as any).eq('id', profileId)
    setSaving(false); setStep(3)
  }

  async function saveStep3() {
    setSaving(true)
    await supabase.from('profiles').update({ name, bio, whatsapp, city, state: stateBr, crm_cro_crp: crm }).eq('id', profileId)
    setSaving(false); setStep(4)
  }

  async function saveStep4() {
    setSaving(true)
    await supabase.from('availability').delete().eq('professional_id', profileId)
    if (avail.length > 0) {
      await supabase.from('availability').insert(avail.map(a => ({ professional_id: profileId, day_of_week: a.day, start_time: a.start, end_time: a.end, slot_minutes: 60 })))
    }
    setSaving(false); setStep(5)
  }

  async function finishOnboarding() {
    setSaving(true)
    await supabase.from('profiles').update({ onboarding_done: true } as any).eq('id', profileId)
    setSaving(false); setStep(6)
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100
  const t = theme // shorthand

  return (
    <div className="min-h-screen bg-offwhite">
      {/* TOP BAR */}
      <div className="bg-white border-b border-nude/40 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="font-display text-xl text-brand-dark">Organiza<span className="text-sage">+</span></div>
          <div className="text-sm text-brand-muted font-medium">Passo {step} de {STEPS.length}</div>
        </div>
        <div className="max-w-2xl mx-auto mt-3">
          <div className="h-1.5 bg-nude rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%`, background: t.primary }}/>
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-0.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all"
                  style={{ background: step > s.id ? t.primary : step === s.id ? t.dark : '#EDE8E0', color: step >= s.id ? 'white' : '#8A9690' }}>
                  {step > s.id ? <Check size={10}/> : s.icon}
                </div>
                <span className={`text-[9px] font-semibold hidden sm:block ${step === s.id ? 'text-brand-dark' : 'text-brand-muted'}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* ── STEP 1: PROFISSÃO ── */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-brand-dark mb-2">Qual é a sua profissão? 🎯</h1>
              <p className="text-brand-muted">Isso define como sua página aparece para os clientes.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {PROFESSIONS.map(p => (
                <button key={p} onClick={() => { setProfession(p); setSelectedSpecs([]) }}
                  className="px-4 py-3 rounded-2xl border-2 text-sm font-semibold text-left transition-all"
                  style={{ borderColor: profession === p ? t.primary : '#EDE8E0', background: profession === p ? t.glow : 'white', color: profession === p ? t.primary : '#2C3530' }}>
                  {p}
                </button>
              ))}
            </div>
            {profession && SPECIALTIES_BY_PROF[profession] && (
              <div className="mb-6">
                <p className="text-sm font-bold text-brand-dark mb-3">Especialidades <span className="text-brand-muted font-normal">(selecione todas que se aplicam)</span></p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES_BY_PROF[profession].map(s => (
                    <button key={s} onClick={() => toggleSpec(s)}
                      className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all"
                      style={{ background: selectedSpecs.includes(s) ? t.primary : 'white', borderColor: selectedSpecs.includes(s) ? t.primary : '#EDE8E0', color: selectedSpecs.includes(s) ? 'white' : '#5A6660' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-nude/40 p-5 mb-8">
              <p className="text-sm font-bold text-brand-dark mb-3">Tipo de atendimento</p>
              <div className="flex gap-3">
                {[{ label:'🏥 Presencial', val: atendPresencial, set: setAtendPresencial }, { label:'💻 Online', val: atendOnline, set: setAtendOnline }].map(btn => (
                  <button key={btn.label} onClick={() => btn.set(!btn.val)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all"
                    style={{ borderColor: btn.val ? t.primary : '#EDE8E0', background: btn.val ? t.glow : '#F7F5F0', color: btn.val ? t.primary : '#8A9690' }}>
                    {btn.val && <Check size={14}/>} {btn.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={saveStep1} disabled={!profession || saving}
              className="w-full text-white font-semibold py-4 rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-base"
              style={{ background: t.dark }}>
              {saving ? 'Salvando...' : <>Continuar <ChevronRight size={18}/></>}
            </button>
          </div>
        )}

        {/* ── STEP 2: TEMA / CORES ── */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-brand-dark mb-2">Escolha as cores da sua página 🎨</h1>
              <p className="text-brand-muted">Sua identidade visual. Pode mudar quando quiser depois.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {THEMES.map(th => (
                <button key={th.id} onClick={() => setTheme(th)}
                  className="relative rounded-2xl border-2 p-4 text-left transition-all overflow-hidden"
                  style={{ borderColor: theme.id === th.id ? th.primary : '#EDE8E0', background: theme.id === th.id ? th.glow : 'white' }}>

                  {/* Color swatches */}
                  <div className="flex gap-1.5 mb-3">
                    {th.preview.map((c, i) => (
                      <div key={i} className="rounded-full" style={{ background: c, width: i === 0 ? 28 : 18, height: i === 0 ? 28 : 18, flexShrink: 0 }}/>
                    ))}
                  </div>

                  <p className="font-bold text-sm text-brand-dark">{th.name}</p>
                  <p className="text-xs text-brand-muted mt-0.5">{th.description}</p>

                  {theme.id === th.id && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: th.primary }}>
                      <Check size={10} color="white"/>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* LIVE PREVIEW */}
            <div className="bg-white rounded-2xl border border-nude/40 overflow-hidden mb-6">
              <div className="px-5 py-3 border-b border-nude flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: t.primary }}/>
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Prévia da sua página</span>
              </div>
              <div>
                {/* mini header */}
                <div className="px-5 py-4" style={{ background: `linear-gradient(135deg, ${t.dark} 0%, ${t.dark}cc 100%)` }}>
                  <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-xl mb-2" style={{ background: t.pale }}>
                    {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover rounded-full"/> : '👤'}
                  </div>
                  <p className="font-display text-base text-white">{name || 'Seu nome'}</p>
                  <p className="text-xs mt-0.5" style={{ color: t.light }}>{profession || 'Profissão'}</p>
                </div>
                {/* mini body */}
                <div className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(selectedSpecs.slice(0,3)).map(s => (
                      <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                        style={{ background: t.glow, borderColor: t.pale, color: t.primary }}>{s}</span>
                    ))}
                    {!selectedSpecs.length && ['Especialidade','Área'].map(s => (
                      <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                        style={{ background: t.glow, borderColor: t.pale, color: t.primary }}>{s}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 text-white text-xs font-semibold py-2.5 rounded-xl text-center"
                      style={{ background: t.dark }}>Agendar consulta →</div>
                    <div className="text-white text-xs px-3 py-2.5 rounded-xl bg-green-500">✉</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-4 border-2 border-nude rounded-2xl text-sm font-semibold text-brand-dark hover:border-sage transition-all">
                ← Voltar
              </button>
              <button onClick={saveStep2} disabled={saving}
                className="flex-1 text-white font-semibold py-4 rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: t.dark }}>
                {saving ? 'Salvando...' : <>Continuar <ChevronRight size={18}/></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: PERFIL ── */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-brand-dark mb-2">Seu perfil profissional 👤</h1>
              <p className="text-brand-muted">Essas informações aparecem na sua página pública.</p>
            </div>
            <div className="bg-white rounded-2xl border border-nude/40 p-6 mb-5 flex items-center gap-5">
              <div className="w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center text-3xl shrink-0" style={{ background: t.pale, borderColor: t.pale }}>
                {photoUrl ? <img src={photoUrl} alt="foto" className="w-full h-full object-cover"/> : '👤'}
              </div>
              <div>
                <p className="font-bold text-brand-dark text-sm mb-1">Foto de perfil</p>
                <p className="text-xs text-brand-muted mb-3">Uma foto profissional aumenta a confiança dos clientes.</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                  style={{ background: t.glow, border: `1px solid ${t.pale}`, color: t.primary }}>
                  <Upload size={13}/> {uploading ? 'Enviando...' : 'Adicionar foto'}
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-nude/40 p-6 space-y-4 mb-6">
              {[
                { label:'Nome completo *', val: name, set: setName, placeholder: 'Ex: Dra. Ana Beatriz Silva' },
                { label:'Registro profissional', val: crm, set: setCrm, placeholder: 'Ex: CRP 06/12345' },
                { label:'WhatsApp *', val: whatsapp, set: setWhatsapp, placeholder: '(11) 99999-9999' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                    className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none bg-offwhite transition-all"
                    style={{ borderColor: 'transparent' }}
                    onFocus={e => e.target.style.borderColor = t.primary}
                    onBlur={e => e.target.style.borderColor = '#EDE8E0'}/>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">Cidade</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="São Paulo"
                    className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none bg-offwhite"
                    onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = '#EDE8E0'}/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">Estado</label>
                  <input value={stateBr} maxLength={2} onChange={e => setStateBr(e.target.value.toUpperCase())} placeholder="SP"
                    className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none bg-offwhite"
                    onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = '#EDE8E0'}/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Bio <span className="text-brand-muted font-normal">(apresentação para os clientes)</span></label>
                <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} maxLength={500}
                  placeholder="Ex: Psicóloga com 8 anos de experiência, especializada em ansiedade e relacionamentos..."
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none bg-offwhite resize-none"
                  onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = '#EDE8E0'}/>
                <p className="text-xs text-brand-muted mt-1">{bio.length}/500</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-4 border-2 border-nude rounded-2xl text-sm font-semibold text-brand-dark hover:border-sage transition-all">← Voltar</button>
              <button onClick={saveStep3} disabled={!name || !whatsapp || saving}
                className="flex-1 text-white font-semibold py-4 rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: t.dark }}>
                {saving ? 'Salvando...' : <>Continuar <ChevronRight size={18}/></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: HORÁRIOS ── */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-brand-dark mb-2">Seus horários de atendimento 📅</h1>
              <p className="text-brand-muted">Clientes só poderão agendar nos horários que você definir aqui.</p>
            </div>
            <div className="bg-white rounded-2xl border border-nude/40 p-5 mb-5 space-y-2">
              {DAYS_FULL.map((day, i) => {
                const a = avail.find(x => x.day === i)
                return (
                  <div key={day} className="flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all"
                    style={{ borderColor: a ? t.pale : '#EDE8E0', background: a ? t.glow : '#F7F5F0' }}>
                    <button onClick={() => toggleDay(i)}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{ background: a ? t.primary : 'white', borderColor: a ? t.primary : '#EDE8E0' }}>
                      {a && <Check size={10} color="white"/>}
                    </button>
                    <span className="text-sm font-semibold w-20" style={{ color: a ? '#2C3530' : '#8A9690' }}>{day}</span>
                    {a ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" value={a.start} onChange={e => updateAvail(i, 'start', e.target.value)}
                          className="border border-nude rounded-lg px-3 py-1.5 text-sm bg-white outline-none"
                          style={{ borderColor: t.pale }}/>
                        <span className="text-brand-muted text-xs">até</span>
                        <input type="time" value={a.end} onChange={e => updateAvail(i, 'end', e.target.value)}
                          className="border border-nude rounded-lg px-3 py-1.5 text-sm bg-white outline-none"
                          style={{ borderColor: t.pale }}/>
                      </div>
                    ) : <span className="text-xs text-brand-muted italic">Clique para ativar</span>}
                  </div>
                )
              })}
            </div>
            <div className="rounded-2xl p-4 mb-6 flex gap-3" style={{ background: t.glow, border: `1px solid ${t.pale}` }}>
              <Clock size={16} style={{ color: t.primary }} className="shrink-0 mt-0.5"/>
              <p className="text-sm" style={{ color: t.primary }}>Os agendamentos são em blocos de <strong>1 hora</strong>. Você pode ajustar depois nas configurações.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-6 py-4 border-2 border-nude rounded-2xl text-sm font-semibold text-brand-dark hover:border-sage transition-all">← Voltar</button>
              <button onClick={saveStep4} disabled={saving}
                className="flex-1 text-white font-semibold py-4 rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: t.dark }}>
                {saving ? 'Salvando...' : <>Continuar <ChevronRight size={18}/></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: PRÉVIA ── */}
        {step === 5 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-brand-dark mb-2">Sua página está pronta! 🌐</h1>
              <p className="text-brand-muted">Veja como os clientes vão te encontrar. Compartilhe esse link.</p>
            </div>

            <div className="bg-white rounded-2xl border border-nude/40 p-5 mb-5">
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Seu link público</p>
              <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: t.glow, border: `1px solid ${t.pale}` }}>
                <Globe size={16} style={{ color: t.primary }} className="shrink-0"/>
                <span className="text-sm font-semibold text-brand-dark flex-1 truncate">organiza-plus-five.vercel.app/p/{slug}</span>
                <button onClick={() => navigator.clipboard.writeText(`https://organiza-plus-five.vercel.app/p/${slug}`)}
                  className="text-xs font-bold hover:underline shrink-0" style={{ color: t.primary }}>Copiar</button>
              </div>
            </div>

            {/* PREVIEW */}
            <div className="bg-white rounded-3xl border border-nude/30 overflow-hidden shadow-md mb-6">
              <div className="p-7 pb-5" style={{ background: `linear-gradient(135deg, ${t.dark} 0%, ${t.dark}dd 100%)` }}>
                <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center text-2xl mb-3 overflow-hidden" style={{ background: t.pale }}>
                  {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover"/> : '👤'}
                </div>
                <h3 className="font-display text-xl text-white">{name || 'Seu nome'}</h3>
                <p className="text-sm mt-0.5" style={{ color: t.light }}>{profession}{crm && ` — ${crm}`}</p>
                {city && <p className="text-xs text-white/40 mt-0.5">📍 {city}{stateBr && `, ${stateBr}`}</p>}
              </div>
              <div className="p-5">
                {selectedSpecs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedSpecs.slice(0,4).map(s => (
                      <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                        style={{ background: t.glow, borderColor: t.pale, color: t.primary }}>{s}</span>
                    ))}
                  </div>
                )}
                {bio && <p className="text-xs text-brand-mid leading-relaxed mb-4">{bio.slice(0, 120)}{bio.length > 120 ? '...' : ''}</p>}
                <div className="flex gap-2">
                  <div className="flex-1 text-white text-xs font-semibold py-2.5 rounded-xl text-center" style={{ background: t.dark }}>Agendar consulta →</div>
                  <div className="text-white text-xs px-3 py-2.5 rounded-xl bg-green-500">✉</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-nude/40 p-5 mb-6">
              <p className="text-sm font-bold text-brand-dark mb-3 flex items-center gap-2"><Sparkles size={15} style={{ color: t.primary }}/> Dicas para atrair mais clientes</p>
              <ul className="space-y-2">
                {['Coloque o link na bio do Instagram e WhatsApp','Adicione uma foto profissional de qualidade','Complete sua bio com diferenciais e experiência','Compartilhe o link com pacientes antigos'].map(tip => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-brand-mid">
                    <Check size={13} style={{ color: t.primary }} className="shrink-0 mt-0.5"/> {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="px-6 py-4 border-2 border-nude rounded-2xl text-sm font-semibold text-brand-dark hover:border-sage transition-all">← Voltar</button>
              <button onClick={finishOnboarding} disabled={saving}
                className="flex-1 text-white font-semibold py-4 rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: t.primary }}>
                {saving ? 'Finalizando...' : <>Ir para o painel <ArrowRight size={18}/></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: CONCLUÍDO ── */}
        {step === 6 && (
          <div className="animate-fadeIn text-center py-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 border-2" style={{ background: t.glow, borderColor: t.pale }}>✨</div>
            <h1 className="font-display text-4xl text-brand-dark mb-3">Tudo pronto!</h1>
            <p className="text-lg text-brand-muted mb-2">Sua página profissional está no ar.</p>
            <p className="text-sm text-brand-muted mb-8">Agora você já pode receber agendamentos automaticamente.</p>

            {/* mini badge de cor escolhida */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 text-sm font-semibold" style={{ background: t.glow, color: t.primary, border: `1px solid ${t.pale}` }}>
              <div className="w-4 h-4 rounded-full" style={{ background: t.primary }}/>
              Tema {t.name} aplicado
            </div>

            <div className="bg-white rounded-2xl border border-nude/40 p-5 mb-6 text-left">
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">Próximos passos</p>
              <div className="space-y-2">
                {[
                  { icon:'📱', label:'Copie o link e cole no Instagram', action: () => navigator.clipboard.writeText(`https://organiza-plus-five.vercel.app/p/${slug}`) },
                  { icon:'💬', label:'Envie para pacientes via WhatsApp', action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Agora você pode agendar comigo online! https://organiza-plus-five.vercel.app/p/${slug}`)}`) },
                  { icon:'📊', label:'Explore o seu painel de gestão', action: () => router.push('/dashboard') },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-nude transition-all text-left group hover:border-opacity-100"
                    style={{ borderColor: '#EDE8E0' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = t.primary, e.currentTarget.style.background = t.glow)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#EDE8E0', e.currentTarget.style.background = 'white')}>
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-semibold text-brand-dark flex-1">{item.label}</span>
                    <ChevronRight size={14} className="text-brand-muted"/>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => router.push('/dashboard')}
              className="w-full text-white font-semibold py-4 rounded-2xl transition-all text-base flex items-center justify-center gap-2"
              style={{ background: t.dark }}>
              Acessar meu painel <ArrowRight size={18}/>
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease both; }
      `}</style>
    </div>
  )
}
