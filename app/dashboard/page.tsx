'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Profile, Appointment } from '@/lib/supabase'
import { Calendar, Users, Clock, Bell, LogOut, Settings, Globe, LayoutDashboard, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const STATUS_STYLE: Record<string,string> = {
  pending:   'bg-amber-50 text-amber-600 border-amber-200',
  confirmed: 'bg-sage-glow text-sage border-sage-pale',
  cancelled: 'bg-red-50 text-red-500 border-red-200',
  completed: 'bg-blue-50 text-blue-500 border-blue-200',
}
const STATUS_LABEL: Record<string,string> = { pending:'Pendente', confirmed:'Confirmado', cancelled:'Cancelado', completed:'Concluído' }

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile|null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'dashboard'|'agenda'|'clientes'|'horarios'|'perfil'>('dashboard')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!p) { router.push('/cadastro'); return }
    setProfile(p)
    const { data: a } = await supabase.from('appointments').select('*').eq('professional_id', user.id).order('appt_date', {ascending:true}).order('appt_time',{ascending:true}).limit(50)
    setAppointments(a || [])
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    await supabase.from('appointments').update({status}).eq('id',id)
    setAppointments(prev => prev.map(a => a.id===id ? {...a, status: status as Appointment['status']} : a))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center">
      <div className="font-display text-2xl text-sage animate-pulse">Organiza+</div>
    </div>
  )

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appt_date === today)
  const pending = appointments.filter(a => a.status === 'pending')
  const totalClients = new Set(appointments.map(a => a.client_phone)).size

  return (
    <div className="min-h-screen bg-offwhite flex">
      {/* SIDEBAR */}
      <aside className="w-60 bg-brand-dark flex flex-col py-6 fixed h-full z-10">
        <div className="font-display text-xl text-cream px-6 pb-5 border-b border-white/10 mb-3">
          Organiza<span className="text-sage-light">+</span>
        </div>
        {([
          ['dashboard','Dashboard',<LayoutDashboard size={16}/>],
          ['agenda','Agenda',<Calendar size={16}/>],
          ['clientes','Clientes',<Users size={16}/>],
          ['horarios','Horários',<Clock size={16}/>],
          ['perfil','Meu perfil',<Settings size={16}/>],
        ] as const).map(([id,lb,ic])=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${tab===id ? 'bg-sage/20 text-sage-light' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
            {ic}{lb}
          </button>
        ))}
        <div className="mt-auto px-3 space-y-2">
          {profile && (
            <Link href={`/p/${profile.slug}`} target="_blank"
              className="flex items-center gap-2 px-3 py-2.5 text-white/30 hover:text-sage-light text-sm rounded-xl hover:bg-white/5 transition-all">
              <Globe size={15}/> Minha página <ExternalLink size={12}/>
            </Link>
          )}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 text-white/30 hover:text-red-400 text-sm rounded-xl hover:bg-white/5 w-full transition-all">
            <LogOut size={15}/> Sair
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-60 p-8">
        {/* DASHBOARD TAB */}
        {tab==='dashboard' && (
          <div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold text-brand-dark">Olá, {profile?.name?.split(' ')[0]} 👋</h1>
                <p className="text-sm text-brand-muted mt-1">{format(new Date(),'EEEE, dd \'de\' MMMM \'de\' yyyy',{locale:ptBR})}</p>
              </div>
              <span className="bg-sage-glow text-sage text-xs font-bold px-4 py-1.5 rounded-full border border-sage-pale capitalize">
                {profile?.plan === 'premium' ? '💎 Premium' : '🌿 Basic'}
              </span>
            </div>

            {/* CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                ['📅','Hoje',String(todayAppts.length),'agendamentos'],
                ['👥','Clientes',String(totalClients),'no total'],
                ['⏳','Pendentes',String(pending.length),'aguardando'],
                ['✅','Total',String(appointments.filter(a=>a.status==='completed').length),'concluídos'],
              ].map(([ic,lb,v,sub])=>(
                <div key={lb} className="bg-white rounded-2xl p-5 border border-nude/40 shadow-soft">
                  <div className="text-xl mb-2">{ic}</div>
                  <p className="text-xs text-brand-muted font-semibold uppercase tracking-wider">{lb}</p>
                  <p className="text-3xl font-bold text-brand-dark mt-1">{v}</p>
                  <p className="text-xs text-sage mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* PENDING */}
            {pending.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Bell size={16} className="text-amber-500"/>
                  <span className="font-bold text-amber-700 text-sm">{pending.length} agendamento{pending.length>1?'s':''} aguardando confirmação</span>
                </div>
                <div className="space-y-2">
                  {pending.slice(0,3).map(a=>(
                    <div key={a.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-amber-100">
                      <div>
                        <p className="font-semibold text-sm text-brand-dark">{a.client_name}</p>
                        <p className="text-xs text-brand-muted">{a.appt_date} às {a.appt_time.slice(0,5)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>updateStatus(a.id,'confirmed')} className="flex items-center gap-1 bg-sage text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-sage-light transition-colors">
                          <CheckCircle size={12}/> Confirmar
                        </button>
                        <button onClick={()=>updateStatus(a.id,'cancelled')} className="flex items-center gap-1 bg-red-100 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
                          <XCircle size={12}/> Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TODAY */}
            <div className="bg-white rounded-2xl border border-nude/40 shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-nude flex justify-between items-center">
                <h2 className="font-bold text-brand-dark">Agendamentos de hoje</h2>
                <span className="bg-sage-glow text-sage text-xs font-bold px-3 py-1 rounded-full">{todayAppts.length} agendamentos</span>
              </div>
              {todayAppts.length === 0 ? (
                <div className="py-12 text-center text-brand-muted text-sm">Nenhum agendamento para hoje.</div>
              ) : todayAppts.map(a=>(
                <div key={a.id} className="flex items-center gap-4 px-6 py-4 border-b border-nude/30 last:border-0">
                  <div className="bg-sage-glow text-sage text-xs font-bold px-3 py-2 rounded-xl min-w-[52px] text-center">{a.appt_time.slice(0,5)}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-brand-dark">{a.client_name}</p>
                    <p className="text-xs text-brand-muted">{a.client_phone}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                  {a.status==='pending' && (
                    <div className="flex gap-1">
                      <button onClick={()=>updateStatus(a.id,'confirmed')} className="bg-sage text-white text-xs px-2.5 py-1 rounded-lg"><CheckCircle size={12}/></button>
                      <button onClick={()=>updateStatus(a.id,'cancelled')} className="bg-red-100 text-red-500 text-xs px-2.5 py-1 rounded-lg"><XCircle size={12}/></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENDA TAB */}
        {tab==='agenda' && (
          <div>
            <h1 className="text-2xl font-bold text-brand-dark mb-6">Todos os agendamentos</h1>
            <div className="bg-white rounded-2xl border border-nude/40 shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-nude">
                <h2 className="font-bold text-brand-dark">Agenda completa</h2>
              </div>
              {appointments.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-4xl mb-3">📅</p>
                  <p className="font-semibold text-brand-dark mb-1">Nenhum agendamento ainda</p>
                  <p className="text-sm text-brand-muted">Compartilhe sua página pública para receber agendamentos.</p>
                  {profile && <Link href={`/p/${profile.slug}`} target="_blank" className="inline-block mt-4 text-sage text-sm font-semibold hover:underline">Ver minha página →</Link>}
                </div>
              ) : appointments.map(a=>(
                <div key={a.id} className="flex items-center gap-4 px-6 py-4 border-b border-nude/30 last:border-0">
                  <div className="text-center min-w-[56px]">
                    <p className="text-xs text-brand-muted">{DAYS[new Date(a.appt_date+'T12:00').getDay()]}</p>
                    <p className="font-bold text-brand-dark text-lg">{a.appt_date.split('-')[2]}</p>
                    <p className="text-xs text-sage font-semibold">{a.appt_time.slice(0,5)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-brand-dark">{a.client_name}</p>
                    <p className="text-xs text-brand-muted">{a.client_phone}{a.client_email && ` · ${a.client_email}`}</p>
                    {a.notes && <p className="text-xs text-brand-mid mt-0.5 italic">"{a.notes}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                    {a.status==='pending' && (
                      <>
                        <button onClick={()=>updateStatus(a.id,'confirmed')} className="bg-sage text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold">✓</button>
                        <button onClick={()=>updateStatus(a.id,'cancelled')} className="bg-red-100 text-red-500 text-xs px-2.5 py-1.5 rounded-lg font-semibold">✗</button>
                      </>
                    )}
                    {a.status==='confirmed' && (
                      <button onClick={()=>updateStatus(a.id,'completed')} className="bg-blue-50 text-blue-500 text-xs px-2.5 py-1.5 rounded-lg font-semibold">Concluir</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENTES TAB */}
        {tab==='clientes' && (
          <div>
            <h1 className="text-2xl font-bold text-brand-dark mb-6">Clientes</h1>
            <div className="bg-white rounded-2xl border border-nude/40 shadow-soft overflow-hidden">
              {(() => {
                const clientMap = new Map<string, typeof appointments>()
                appointments.forEach(a => {
                  const key = a.client_phone
                  if (!clientMap.has(key)) clientMap.set(key, [])
                  clientMap.get(key)!.push(a)
                })
                const clients = Array.from(clientMap.entries())
                if (clients.length === 0) return (
                  <div className="py-16 text-center text-brand-muted text-sm">Nenhum cliente ainda.</div>
                )
                return clients.map(([phone, appts]) => (
                  <div key={phone} className="flex items-center gap-4 px-6 py-4 border-b border-nude/30 last:border-0">
                    <div className="w-10 h-10 rounded-full bg-sage-glow flex items-center justify-center font-bold text-sage text-sm">
                      {appts[0].client_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-brand-dark">{appts[0].client_name}</p>
                      <p className="text-xs text-brand-muted">{phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-dark">{appts.length}</p>
                      <p className="text-xs text-brand-muted">consulta{appts.length!==1?'s':''}</p>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}

        {/* HORÁRIOS TAB */}
        {tab==='horarios' && <AvailabilityTab profile={profile}/>}

        {/* PERFIL TAB */}
        {tab==='perfil' && <ProfileTab profile={profile} onSave={load}/>}
      </main>
    </div>
  )
}

function AvailabilityTab({ profile }: { profile: Profile|null }) {
  const [avail, setAvail] = useState<{day:number,start:string,end:string}[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const DAYS_FULL = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

  useEffect(() => {
    if (!profile) return
    supabase.from('availability').select('*').eq('professional_id', profile.id).eq('active',true)
      .then(({data}) => {
        if (data) setAvail(data.map(d=>({day:d.day_of_week,start:d.start_time,end:d.end_time})))
      })
  }, [profile])

  function toggleDay(d: number) {
    setAvail(prev => prev.some(a=>a.day===d) ? prev.filter(a=>a.day!==d) : [...prev, {day:d,start:'08:00',end:'18:00'}])
  }
  function update(d:number, k:string, v:string) {
    setAvail(prev => prev.map(a => a.day===d ? {...a,[k]:v} : a))
  }

  async function save() {
    if (!profile) return
    setSaving(true)
    await supabase.from('availability').delete().eq('professional_id', profile.id)
    if (avail.length > 0) {
      await supabase.from('availability').insert(
        avail.map(a=>({professional_id:profile.id, day_of_week:a.day, start_time:a.start, end_time:a.end, slot_minutes:60}))
      )
    }
    setSaving(false); setSaved(true)
    setTimeout(()=>setSaved(false),2500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-2">Horários disponíveis</h1>
      <p className="text-sm text-brand-muted mb-6">Configure os dias e horários em que você atende.</p>
      <div className="bg-white rounded-2xl border border-nude/40 shadow-soft p-6 space-y-3">
        {DAYS_FULL.map((day,i) => {
          const a = avail.find(x=>x.day===i)
          return (
            <div key={day} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${a ? 'border-sage-pale bg-sage-glow' : 'border-nude bg-offwhite'}`}>
              <button onClick={()=>toggleDay(i)} className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${a ? 'bg-sage border-sage text-white' : 'border-nude'}`}>
                {a && <Check size={10}/>}
              </button>
              <span className="text-sm font-semibold text-brand-dark w-24">{day}</span>
              {a ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={a.start} onChange={e=>update(i,'start',e.target.value)}
                    className="border border-nude rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-sage"/>
                  <span className="text-brand-muted text-sm">até</span>
                  <input type="time" value={a.end} onChange={e=>update(i,'end',e.target.value)}
                    className="border border-nude rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-sage"/>
                </div>
              ) : (
                <span className="text-sm text-brand-muted">Indisponível</span>
              )}
            </div>
          )
        })}
        <button onClick={save} disabled={saving} className="w-full bg-brand-dark text-cream font-semibold py-3.5 rounded-xl hover:bg-sage transition-colors disabled:opacity-50 mt-2">
          {saved ? '✓ Salvo!' : saving ? 'Salvando...' : 'Salvar horários'}
        </button>
      </div>
    </div>
  )
}

function Check({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
}

function ProfileTab({ profile, onSave }: { profile: Profile|null, onSave: ()=>void }) {
  const [form, setForm] = useState({ name:'', bio:'', whatsapp:'', city:'', state:'', specialties:'', crm_cro_crp:'', instagram:'' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) setForm({
      name: profile.name||'', bio: profile.bio||'', whatsapp: profile.whatsapp||'',
      city: profile.city||'', state: profile.state||'',
      specialties: (profile.specialties||[]).join(', '), crm_cro_crp: profile.crm_cro_crp||'', instagram: profile.instagram||''
    })
  }, [profile])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({
      name: form.name, bio: form.bio, whatsapp: form.whatsapp,
      city: form.city, state: form.state, crm_cro_crp: form.crm_cro_crp, instagram: form.instagram,
      specialties: form.specialties.split(',').map(s=>s.trim()).filter(Boolean),
    }).eq('id', profile.id)
    setSaving(false); setSaved(true); onSave()
    setTimeout(()=>setSaved(false),2500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-2">Meu perfil</h1>
      <p className="text-sm text-brand-muted mb-6">Essas informações aparecem na sua página pública.</p>
      <form onSubmit={save} className="bg-white rounded-2xl border border-nude/40 shadow-soft p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1.5">Nome completo</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1.5">CRM / CRO / CRP</label>
            <input value={form.crm_cro_crp} onChange={e=>setForm(f=>({...f,crm_cro_crp:e.target.value}))}
              className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite" placeholder="CRP 06/12345"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1.5">WhatsApp</label>
            <input value={form.whatsapp} onChange={e=>setForm(f=>({...f,whatsapp:e.target.value}))}
              className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite" placeholder="(11) 99999-9999"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1.5">Instagram</label>
            <input value={form.instagram} onChange={e=>setForm(f=>({...f,instagram:e.target.value}))}
              className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite" placeholder="@usuario"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1.5">Cidade</label>
            <input value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))}
              className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-1.5">Estado</label>
            <input value={form.state} maxLength={2} onChange={e=>setForm(f=>({...f,state:e.target.value}))}
              className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite" placeholder="SP"/>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1.5">Especialidades (separadas por vírgula)</label>
          <input value={form.specialties} onChange={e=>setForm(f=>({...f,specialties:e.target.value}))}
            className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"/>
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-1.5">Bio</label>
          <textarea rows={4} value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))}
            className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite resize-none"/>
        </div>
        <button type="submit" disabled={saving} className="w-full bg-brand-dark text-cream font-semibold py-3.5 rounded-xl hover:bg-sage transition-colors disabled:opacity-50">
          {saved ? '✓ Perfil salvo!' : saving ? 'Salvando...' : 'Salvar perfil'}
        </button>
      </form>
      {profile && (
        <div className="mt-4 bg-sage-glow border border-sage-pale rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-sage">Sua página pública</p>
            <p className="text-xs text-brand-muted">organizamais.com/p/{profile.slug}</p>
          </div>
          <Link href={`/p/${profile.slug}`} target="_blank" className="flex items-center gap-1 text-sage text-sm font-semibold hover:underline">
            Ver <ExternalLink size={13}/>
          </Link>
        </div>
      )}
    </div>
  )
}
