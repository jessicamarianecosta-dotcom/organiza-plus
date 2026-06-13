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

type Avail = { day: number; start: string; end: string }

const STEPS = [
  { id: 1, label: 'Profissão',  icon: '🎯' },
  { id: 2, label: 'Perfil',     icon: '👤' },
  { id: 3, label: 'Horários',   icon: '📅' },
  { id: 4, label: 'Sua página', icon: '🌐' },
  { id: 5, label: 'Pronto!',    icon: '✨' },
]

export default function Onboarding() {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep]             = useState(1)
  const [profileId, setProfileId]   = useState('')
  const [slug, setSlug]             = useState('')
  const [saving, setSaving]         = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [photoUrl, setPhotoUrl]     = useState('')

  // Step 1 — Profissão
  const [profession, setProfession]   = useState('')
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([])
  const [atendOnline, setAtendOnline] = useState(false)
  const [atendPresencial, setAtendPresencial] = useState(true)

  // Step 2 — Perfil
  const [name, setName]       = useState('')
  const [bio, setBio]         = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [city, setCity]       = useState('')
  const [state, setState]     = useState('')
  const [crm, setCrm]         = useState('')

  // Step 3 — Horários
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
      supabase.from('profiles').select('id,slug,name,profession,bio,whatsapp,city,state,crm_cro_crp,photo_url,specialties,online,in_person,onboarding_done')
        .eq('id', user.id).single().then(({ data: p }) => {
          if (!p) { router.push('/cadastro'); return }
          if ((p as any).onboarding_done) { router.push('/dashboard'); return }
          setProfileId(p.id)
          setSlug(p.slug || '')
          setName(p.name || '')
          setBio(p.bio || '')
          setWhatsapp(p.whatsapp || '')
          setCity(p.city || '')
          setState(p.state || '')
          setCrm(p.crm_cro_crp || '')
          setPhotoUrl(p.photo_url || '')
          setProfession(p.profession || '')
          setSelectedSpecs(p.specialties || [])
          setAtendOnline(p.online || false)
          setAtendPresencial(p.in_person !== false)
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
    await supabase.from('profiles').update({
      profession, specialties: selectedSpecs,
      online: atendOnline, in_person: atendPresencial,
    }).eq('id', profileId)
    setSaving(false); setStep(2)
  }

  async function saveStep2() {
    setSaving(true)
    await supabase.from('profiles').update({
      name, bio, whatsapp, city, state, crm_cro_crp: crm,
    }).eq('id', profileId)
    setSaving(false); setStep(3)
  }

  async function saveStep3() {
    setSaving(true)
    await supabase.from('availability').delete().eq('professional_id', profileId)
    if (avail.length > 0) {
      await supabase.from('availability').insert(
        avail.map(a => ({ professional_id: profileId, day_of_week: a.day, start_time: a.start, end_time: a.end, slot_minutes: 60 }))
      )
    }
    setSaving(false); setStep(4)
  }

  async function finishOnboarding() {
    setSaving(true)
    await supabase.from('profiles').update({ onboarding_done: true } as any).eq('id', profileId)
    setSaving(false); setStep(5)
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-offwhite">
      {/* TOP BAR */}
      <div className="bg-white border-b border-nude/40 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="font-display text-xl text-brand-dark">
            Organiza<span className="text-sage">+</span>
          </div>
          <div className="text-sm text-brand-muted font-medium">
            Passo {step} de {STEPS.length}
          </div>
        </div>
        {/* PROGRESS BAR */}
        <div className="max-w-2xl mx-auto mt-3">
          <div className="h-1.5 bg-nude rounded-full overflow-hidden">
            <div className="h-full bg-sage rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}/>
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-0.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${step > s.id ? 'bg-sage text-white' : step === s.id ? 'bg-brand-dark text-white' : 'bg-nude text-brand-muted'}`}>
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

            {/* Profissão */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {PROFESSIONS.map(p => (
                <button key={p} onClick={() => { setProfession(p); setSelectedSpecs([]) }}
                  className={`px-4 py-3 rounded-2xl border-2 text-sm font-semibold text-left transition-all ${profession === p ? 'border-sage bg-sage-glow text-sage' : 'border-nude bg-white text-brand-dark hover:border-sage-light hover:bg-sage-glow/50'}`}>
                  {p}
                </button>
              ))}
            </div>

            {/* Especialidades */}
            {profession && SPECIALTIES_BY_PROF[profession] && (
              <div className="mb-6">
                <p className="text-sm font-bold text-brand-dark mb-3">Suas especialidades <span className="text-brand-muted font-normal">(selecione todas que se aplicam)</span></p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES_BY_PROF[profession].map(s => (
                    <button key={s} onClick={() => toggleSpec(s)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${selectedSpecs.includes(s) ? 'bg-sage border-sage text-white' : 'bg-white border-nude text-brand-mid hover:border-sage-light'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tipo de atendimento */}
            <div className="bg-white rounded-2xl border border-nude/40 p-5 mb-8">
              <p className="text-sm font-bold text-brand-dark mb-3">Tipo de atendimento</p>
              <div className="flex gap-3">
                <button onClick={() => setAtendPresencial(!atendPresencial)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${atendPresencial ? 'border-sage bg-sage-glow text-sage' : 'border-nude bg-offwhite text-brand-muted'}`}>
                  {atendPresencial ? <Check size={14}/> : <div className="w-3.5 h-3.5"/>} 🏥 Presencial
                </button>
                <button onClick={() => setAtendOnline(!atendOnline)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${atendOnline ? 'border-sage bg-sage-glow text-sage' : 'border-nude bg-offwhite text-brand-muted'}`}>
                  {atendOnline ? <Check size={14}/> : <div className="w-3.5 h-3.5"/>} 💻 Online
                </button>
              </div>
            </div>

            <button onClick={saveStep1} disabled={!profession || saving}
              className="w-full bg-brand-dark text-cream font-semibold py-4 rounded-2xl hover:bg-sage transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-base">
              {saving ? 'Salvando...' : <>Continuar <ChevronRight size={18}/></>}
            </button>
          </div>
        )}

        {/* ── STEP 2: PERFIL ── */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-brand-dark mb-2">Seu perfil profissional 👤</h1>
              <p className="text-brand-muted">Essas informações aparecem na sua página pública.</p>
            </div>

            {/* FOTO */}
            <div className="bg-white rounded-2xl border border-nude/40 p-6 mb-5 flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-sage-pale border-2 border-nude overflow-hidden flex items-center justify-center text-3xl shrink-0">
                {photoUrl ? <img src={photoUrl} alt="foto" className="w-full h-full object-cover"/> : '👤'}
              </div>
              <div>
                <p className="font-bold text-brand-dark text-sm mb-1">Foto de perfil</p>
                <p className="text-xs text-brand-muted mb-3">Uma foto profissional aumenta muito a confiança dos clientes.</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 bg-sage-glow border border-sage-pale text-sage text-xs font-bold px-4 py-2 rounded-xl hover:bg-sage hover:text-cream transition-all">
                  <Upload size={13}/> {uploading ? 'Enviando...' : 'Adicionar foto'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-nude/40 p-6 space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Nome completo *</label>
                <input required value={name} onChange={e => setName(e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"
                  placeholder="Ex: Dra. Ana Beatriz Silva"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">
                  Registro profissional <span className="text-brand-muted font-normal">(CRM, CRP, CRN...)</span>
                </label>
                <input value={crm} onChange={e => setCrm(e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"
                  placeholder="Ex: CRP 06/12345"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">WhatsApp *</label>
                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"
                  placeholder="(11) 99999-9999"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">Cidade</label>
                  <input value={city} onChange={e => setCity(e.target.value)}
                    className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"
                    placeholder="São Paulo"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">Estado</label>
                  <input value={state} maxLength={2} onChange={e => setState(e.target.value.toUpperCase())}
                    className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"
                    placeholder="SP"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">
                  Sua bio <span className="text-brand-muted font-normal">(apresentação para os clientes)</span>
                </label>
                <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite resize-none"
                  placeholder="Ex: Psicóloga com 8 anos de experiência, especializada em ansiedade e relacionamentos. Atendo adultos e adolescentes com foco em TCC..."/>
                <p className="text-xs text-brand-muted mt-1">{bio.length}/500 caracteres</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-4 border-2 border-nude rounded-2xl text-sm font-semibold text-brand-dark hover:border-sage transition-all">
                ← Voltar
              </button>
              <button onClick={saveStep2} disabled={!name || !whatsapp || saving}
                className="flex-1 bg-brand-dark text-cream font-semibold py-4 rounded-2xl hover:bg-sage transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                {saving ? 'Salvando...' : <>Continuar <ChevronRight size={18}/></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: HORÁRIOS ── */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-brand-dark mb-2">Seus horários de atendimento 📅</h1>
              <p className="text-brand-muted">Clientes só poderão agendar nos horários que você definir aqui.</p>
            </div>

            <div className="bg-white rounded-2xl border border-nude/40 p-5 mb-6 space-y-2">
              {DAYS_FULL.map((day, i) => {
                const a = avail.find(x => x.day === i)
                return (
                  <div key={day} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${a ? 'border-sage-pale bg-sage-glow' : 'border-nude bg-offwhite'}`}>
                    <button onClick={() => toggleDay(i)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${a ? 'bg-sage border-sage text-white' : 'border-nude bg-white'}`}>
                      {a && <Check size={10}/>}
                    </button>
                    <span className={`text-sm font-semibold w-20 ${a ? 'text-brand-dark' : 'text-brand-muted'}`}>{day}</span>
                    {a ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" value={a.start} onChange={e => updateAvail(i, 'start', e.target.value)}
                          className="border border-nude rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-sage"/>
                        <span className="text-brand-muted text-xs">até</span>
                        <input type="time" value={a.end} onChange={e => updateAvail(i, 'end', e.target.value)}
                          className="border border-nude rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-sage"/>
                      </div>
                    ) : (
                      <span className="text-xs text-brand-muted italic">Clique para ativar</span>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-sage-glow border border-sage-pale rounded-2xl p-4 mb-6 flex gap-3">
              <Clock size={16} className="text-sage shrink-0 mt-0.5"/>
              <p className="text-sm text-sage">Os agendamentos são feitos em blocos de <strong>1 hora</strong>. Você pode ajustar isso depois nas configurações.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-4 border-2 border-nude rounded-2xl text-sm font-semibold text-brand-dark hover:border-sage transition-all">
                ← Voltar
              </button>
              <button onClick={saveStep3} disabled={saving}
                className="flex-1 bg-brand-dark text-cream font-semibold py-4 rounded-2xl hover:bg-sage transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                {saving ? 'Salvando...' : <>Continuar <ChevronRight size={18}/></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: PRÉVIA DA PÁGINA ── */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-brand-dark mb-2">Sua página está pronta! 🌐</h1>
              <p className="text-brand-muted">Veja como os clientes vão te encontrar. Compartilhe esse link nas suas redes.</p>
            </div>

            {/* LINK */}
            <div className="bg-white rounded-2xl border border-nude/40 p-5 mb-5">
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Seu link público</p>
              <div className="flex items-center gap-3 bg-sage-glow border border-sage-pale rounded-xl px-4 py-3">
                <Globe size={16} className="text-sage shrink-0"/>
                <span className="text-sm font-semibold text-brand-dark flex-1 truncate">
                  organiza-plus-five.vercel.app/p/{slug}
                </span>
                <button onClick={() => navigator.clipboard.writeText(`https://organiza-plus-five.vercel.app/p/${slug}`)}
                  className="text-sage text-xs font-bold hover:underline shrink-0">
                  Copiar
                </button>
              </div>
            </div>

            {/* PREVIEW CARD */}
            <div className="bg-white rounded-3xl border border-nude/30 overflow-hidden shadow-md mb-6">
              <div className="p-7 pb-5" style={{ background: 'linear-gradient(135deg, #2C3530 0%, #3d4f47 100%)' }}>
                <div className="w-16 h-16 rounded-full bg-sage-pale border-2 border-white/20 flex items-center justify-center text-2xl mb-3 overflow-hidden">
                  {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover"/> : '👤'}
                </div>
                <h3 className="font-display text-xl text-cream">{name || 'Seu nome'}</h3>
                <p className="text-sage-light text-sm mt-0.5">{profession}{crm && ` — ${crm}`}</p>
                {city && <p className="text-white/40 text-xs mt-0.5">📍 {city}{state && `, ${state}`}</p>}
              </div>
              <div className="p-5">
                {selectedSpecs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedSpecs.slice(0,4).map(s => (
                      <span key={s} className="bg-sage-glow border border-sage-pale text-sage text-xs font-semibold px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                    {selectedSpecs.length > 4 && <span className="bg-sage-glow border border-sage-pale text-sage text-xs font-semibold px-2.5 py-1 rounded-full">+{selectedSpecs.length - 4}</span>}
                  </div>
                )}
                {bio && <p className="text-xs text-brand-mid leading-relaxed mb-4">{bio.slice(0, 120)}{bio.length > 120 ? '...' : ''}</p>}
                <div className="flex gap-2">
                  <div className="flex-1 bg-brand-dark text-cream text-xs font-semibold py-2.5 rounded-xl text-center">Agendar consulta →</div>
                  <div className="bg-green-500 text-white text-xs px-3 py-2.5 rounded-xl">✉</div>
                </div>
              </div>
            </div>

            {/* DICAS */}
            <div className="bg-white rounded-2xl border border-nude/40 p-5 mb-6">
              <p className="text-sm font-bold text-brand-dark mb-3 flex items-center gap-2"><Sparkles size={15} className="text-sage"/> Dicas para atrair mais clientes</p>
              <ul className="space-y-2">
                {[
                  'Coloque o link na bio do Instagram e WhatsApp',
                  'Adicione uma foto profissional de qualidade',
                  'Complete sua bio com diferenciais e experiência',
                  'Compartilhe o link com pacientes antigos',
                ].map(t => (
                  <li key={t} className="flex items-start gap-2 text-sm text-brand-mid">
                    <Check size={13} className="text-sage shrink-0 mt-0.5"/> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-6 py-4 border-2 border-nude rounded-2xl text-sm font-semibold text-brand-dark hover:border-sage transition-all">
                ← Voltar
              </button>
              <button onClick={finishOnboarding} disabled={saving}
                className="flex-1 bg-sage text-cream font-semibold py-4 rounded-2xl hover:bg-sage-light transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                {saving ? 'Finalizando...' : <>Ir para o painel <ArrowRight size={18}/></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: CONCLUÍDO ── */}
        {step === 5 && (
          <div className="animate-fadeIn text-center py-8">
            <div className="w-24 h-24 bg-sage-glow rounded-full flex items-center justify-center text-5xl mx-auto mb-6 border-2 border-sage-pale">
              ✨
            </div>
            <h1 className="font-display text-4xl text-brand-dark mb-3">Tudo pronto!</h1>
            <p className="text-lg text-brand-muted mb-2">Sua página profissional está no ar.</p>
            <p className="text-sm text-brand-muted mb-8">Agora você já pode receber agendamentos automaticamente.</p>

            <div className="bg-white rounded-2xl border border-nude/40 p-5 mb-8 text-left">
              <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">Próximos passos recomendados</p>
              <div className="space-y-3">
                {[
                  { icon:'📱', label:'Copie o link e cole no seu Instagram', action: () => navigator.clipboard.writeText(`https://organiza-plus-five.vercel.app/p/${slug}`) },
                  { icon:'💬', label:'Envie para pacientes via WhatsApp', action: () => window.open(`https://wa.me/?text=Agora você pode agendar comigo online! ${encodeURIComponent(`https://organiza-plus-five.vercel.app/p/${slug}`)}`) },
                  { icon:'📊', label:'Explore o seu painel de gestão', action: () => router.push('/dashboard') },
                ].map(item => (
                  <button key={item.label} onClick={item.action}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-nude hover:border-sage hover:bg-sage-glow transition-all text-left group">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-semibold text-brand-dark group-hover:text-sage transition-colors flex-1">{item.label}</span>
                    <ChevronRight size={14} className="text-brand-muted group-hover:text-sage transition-colors"/>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => router.push('/dashboard')}
              className="w-full bg-brand-dark text-cream font-semibold py-4 rounded-2xl hover:bg-sage transition-all text-base flex items-center justify-center gap-2">
              Acessar meu painel <ArrowRight size={18}/>
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease both; }
      `}</style>
    </div>
  )
}
