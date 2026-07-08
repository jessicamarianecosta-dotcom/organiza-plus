'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase, Profile, Appointment } from '@/lib/supabase'
import { T, GlobalStyles, Btn, Badge, Input, Alert, ProgressBar } from '@/lib/ds'
import DynamicSpecialties from '@/lib/DynamicSpecialties'
import PhotoCropper from '@/lib/PhotoCropper'
import { AgendaBlocksSection, AgendaBlock } from '@/lib/ScheduleConfig'
import { LayoutDashboard, Calendar, Users, Clock, Settings, Globe, LogOut, TrendingUp, CreditCard, ExternalLink, CheckCircle, XCircle, X, Menu, ChevronRight, Bell } from 'lucide-react'

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

type Tab = 'dashboard'|'agenda'|'clientes'|'horarios'|'perfil'

const NAV_ITEMS: [Tab, string, any][] = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['agenda',    'Agenda',    Calendar],
  ['clientes',  'Clientes',  Users],
  ['horarios',  'Horários',  Clock],
  ['perfil',    'Meu perfil',Settings],
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg:string, color:string, label:string }> = {
    pending:   { bg:'rgba(217,119,6,0.1)',  color:T.amber, label:'Pendente' },
    confirmed: { bg:T.sageG,                color:T.sage,  label:'Confirmado' },
    cancelled: { bg:T.redL,                 color:T.red,   label:'Cancelado' },
    completed: { bg:T.blueL,                color:T.blue,  label:'Concluído' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:T.r100, background:s.bg, color:s.color, whiteSpace:'nowrap' }}>
      {s.label}
    </span>
  )
}

function DashboardContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [profile, setProfile] = useState<Profile|null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [hasSchedule, setHasSchedule] = useState(false)
  const [notifErrors, setNotifErrors] = useState<Record<string, string>>({}) // appointmentId → error msg

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!p) { router.push('/onboarding'); return }
      if (!(p as any).onboarding_done) { router.push('/onboarding'); return }
      setProfile(p)
      const [{ data: a }, { count: schedCount }] = await Promise.all([
        supabase.from('appointments').select('*').eq('professional_id', user.id).order('appt_date',{ascending:true}).order('appt_time',{ascending:true}).limit(100),
        supabase.from('availability').select('*', { count:'exact', head:true }).eq('professional_id', user.id).eq('active', true),
      ])
      setAppointments(a || [])
      setHasSchedule((schedCount || 0) > 0)
      setLoading(false)
      if (params.get('payment') === 'success') setToast('🎉 Pagamento confirmado! Plano ativado.')
    } catch {
      router.push('/login')
    }
  }, [router, params])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    const updates: Record<string, unknown> = { status }
    if (status === 'confirmed') updates.confirmed_at = new Date().toISOString()
    await supabase.from('appointments').update(updates).eq('id', id)
    setAppointments(prev => prev.map(a => a.id===id ? {...a, status: status as any} : a))

    if (status === 'confirmed') {
      const appt = appointments.find(a => a.id === id)
      if (!appt || !profile) return

      const modality = profile.online && !profile.in_person ? 'Online'
        : !profile.online && profile.in_person ? 'Presencial' : 'Online ou Presencial'

      const errors: string[] = []

      // Send confirmation email to client
      if (appt.client_email) {
        const emailRes = await fetch('/api/email', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            type: 'appointment_confirmed',
            to: appt.client_email,
            appointment_id: id,
            professional_id: profile.id,
            client: appt.client_name,
            professional: profile.name,
            date: appt.appt_date,
            time: appt.appt_time.slice(0,5),
            modality,
          })
        })
        const emailData = await emailRes.json()
        if (!emailData.ok) errors.push(`E-mail: ${emailData.error || 'falha'}`)
      }

      // Send WhatsApp confirmation to client
      if (appt.client_phone) {
        const wppRes = await fetch('/api/whatsapp', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            type: 'confirmed',
            appointment_id: id,
            professional_id: profile.id,
            professional_name: profile.name,
            client_name: appt.client_name,
            client_phone: appt.client_phone,
            appt_date: appt.appt_date,
            appt_time: appt.appt_time.slice(0,5),
            modality,
          })
        })
        const wppData = await wppRes.json()
        if (!wppData.sent && process.env.NEXT_PUBLIC_WPP_ENABLED === 'true') {
          errors.push(`WhatsApp: ${wppData.error || 'não enviado'}`)
        }
      }

      if (errors.length > 0) {
        setNotifErrors(prev => ({ ...prev, [id]: errors.join(' · ') }))
      } else {
        setNotifErrors(prev => { const n = {...prev}; delete n[id]; return n })
        setToast('✅ Consulta confirmada e paciente notificado!')
      }
    }
  }

  async function retryNotification(id: string) {
    setNotifErrors(prev => { const n = {...prev}; delete n[id]; return n })
    await updateStatus(id, 'confirmed')
  }

  async function logout() { await supabase.auth.signOut(); router.push('/') }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:T.off, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.fontSans }}>
      <GlobalStyles/>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:T.fontSerif, fontSize:28, color:T.dark, marginBottom:12 }}>Organiza<span style={{ color:T.sage }}>+</span></div>
        <div style={{ width:32, height:32, border:`3px solid ${T.sageP}`, borderTopColor:T.sage, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
      </div>
    </div>
  )

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appt_date === today)
  const pending = appointments.filter(a => a.status === 'pending')
  const totalClients = new Set(appointments.map(a => a.client_phone)).size

  const nowTimeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
  const nextAppt = appointments.find(a => a.status !== 'cancelled' && (a.appt_date > today || (a.appt_date === today && a.appt_time > nowTimeStr)))

  const nonCancelled = appointments.filter(a => a.status !== 'cancelled')
  const confirmed = appointments.filter(a => a.status === 'confirmed' || a.status === 'completed')
  const confirmRate = nonCancelled.length > 0 ? Math.round(confirmed.length / nonCancelled.length * 100) : 0

  const thisMonthStr = `${today.slice(0,7)}`
  const prevPhones = new Set(appointments.filter(a => !a.appt_date.startsWith(thisMonthStr)).map(a => a.client_phone))
  const newPatientsMonth = new Set(appointments.filter(a => a.appt_date.startsWith(thisMonthStr) && !prevPhones.has(a.client_phone)).map(a => a.client_phone)).size

  const in7Str = new Date(now.getTime() + 7*24*60*60*1000).toISOString().split('T')[0]
  const upcomingAppts = appointments.filter(a => a.appt_date > today && a.appt_date <= in7Str && a.status !== 'cancelled')

  const profileChecks = [
    { label:'Foto de perfil',          done:!!profile?.photo_url },
    { label:'WhatsApp',                done:!!profile?.whatsapp },
    { label:'Horários configurados',   done:hasSchedule },
    { label:'Especialidades',          done:(profile?.specialties||[]).length > 0 },
    { label:'Biografia',               done:!!profile?.bio },
    { label:'Instagram',               done:!!profile?.instagram },
  ]
  const completionPct = Math.round(profileChecks.filter(c=>c.done).length / profileChecks.length * 100)

  const alerts: string[] = []
  if (pending.length > 0) alerts.push(`${pending.length} agendamento${pending.length>1?'s':''} aguardando confirmação`)
  if (!profile?.bio) alerts.push('Complete sua biografia para atrair mais pacientes')
  if (!profile?.photo_url) alerts.push('Adicione uma foto de perfil ao seu cadastro')
  if (!hasSchedule) alerts.push('Configure seus horários de atendimento')

  const sidebarW = 224

  return (
    <div style={{ minHeight:'100vh', background:T.off, fontFamily:T.fontSans, color:T.dark }}>
      <GlobalStyles/>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:200, background:T.sage, color:T.cream, padding:'12px 18px', borderRadius:T.r14, boxShadow:T.shadowLg, display:'flex', alignItems:'center', gap:10, fontSize:13, fontWeight:600 }}>
          {toast}
          <button onClick={()=>setToast('')} style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', padding:2 }}><X size={14}/></button>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:40, backdropFilter:'blur(2px)' }}/>}

      {/* ── SIDEBAR ── */}
      <aside style={{
        position:'fixed', top:0, left:0, height:'100vh', width:sidebarW,
        background:T.dark, display:'flex', flexDirection:'column', zIndex:50,
        transition:'transform 0.3s ease',
        transform: typeof window !== 'undefined' && window.innerWidth < 768 && !sidebarOpen ? `translateX(-${sidebarW}px)` : 'none',
      }} className="sidebar">
        <style>{`.sidebar { @media(max-width:767px){ transform: ${sidebarOpen?'translateX(0)':'translateX(-224px)'}; } }`}</style>
        {/* Logo */}
        <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:T.sage }}/>
            <span style={{ fontFamily:T.fontSerif, fontSize:18, color:T.cream }}>
              Organiza<span style={{ color:T.sageL }}>+</span>
            </span>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex:1, padding:'4px 10px', display:'flex', flexDirection:'column', gap:2 }}>
          {NAV_ITEMS.map(([id, label, Icon]) => (
            <button key={id} onClick={()=>{setTab(id);setSidebarOpen(false)}}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:T.r12, fontSize:13, fontWeight:500, border:'none', cursor:'pointer', textAlign:'left', transition:'all 0.15s', background:tab===id?'rgba(122,158,135,0.2)':'transparent', color:tab===id?T.sageL:'rgba(255,255,255,0.38)' }}
              onMouseEnter={e=>{ if(tab!==id) e.currentTarget.style.background='rgba(255,255,255,0.06)'; if(tab!==id) e.currentTarget.style.color='rgba(255,255,255,0.7)' }}
              onMouseLeave={e=>{ if(tab!==id) e.currentTarget.style.background='transparent'; if(tab!==id) e.currentTarget.style.color='rgba(255,255,255,0.38)' }}>
              <Icon size={16}/> {label}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 10px 20px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', gap:1 }}>
          <Link href="/dashboard/agenda" style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:T.r12, fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.32)', textDecoration:'none', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color=T.sageL}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.32)'}}>
            <Calendar size={14}/> Agenda & Workspace
          </Link>
          <Link href="/dashboard/analytics" style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:T.r12, fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.32)', textDecoration:'none', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color=T.sageL}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.32)'}}>
            <TrendingUp size={14}/> Analytics
          </Link>
          <Link href="/planos" style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:T.r12, fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.32)', textDecoration:'none', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color=T.sageL}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.32)'}}>
            <CreditCard size={14}/> Planos
          </Link>
          {profile && (
            <Link href={`/p/${profile.slug}`} target="_blank" style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:T.r12, fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.32)', textDecoration:'none', transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color=T.sageL}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.32)'}}>
              <Globe size={14}/> Minha página <ExternalLink size={11}/>
            </Link>
          )}
          <button onClick={logout} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:T.r12, fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.32)', background:'none', border:'none', cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.12)';e.currentTarget.style.color='#f87171'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.32)'}}>
            <LogOut size={14}/> Sair
          </button>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header style={{ position:'fixed', top:0, left:0, right:0, height:56, background:T.dark, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', zIndex:30, borderBottom:'1px solid rgba(255,255,255,0.06)' }} className="md-hide">
        <style>{`@media(min-width:768px){ .md-hide{ display:none!important; } .main-content{ margin-left:${sidebarW}px!important; } } @media(max-width:767px){ .main-content{ margin-left:0!important; padding-top:72px!important; padding-bottom:80px!important; } }`}</style>
        <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{ background:'none', border:'none', color:T.cream, cursor:'pointer', padding:4 }}>
          <Menu size={22}/>
        </button>
        <span style={{ fontFamily:T.fontSerif, fontSize:18, color:T.cream }}>Organiza<span style={{ color:T.sageL }}>+</span></span>
        {profile && <Link href={`/p/${profile.slug}`} target="_blank" style={{ color:'rgba(255,255,255,0.4)', display:'flex' }}><Globe size={18}/></Link>}
      </header>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:T.dark, borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-around', padding:'6px 0 8px', zIndex:30 }} className="md-hide">
        {NAV_ITEMS.map(([id, label, Icon]) => (
          <button key={id} onClick={()=>setTab(id)}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:'6px 12px', background:'none', border:'none', cursor:'pointer', color:tab===id?T.sageL:'rgba(255,255,255,0.3)', transition:'color 0.15s' }}>
            <Icon size={20}/>
            <span style={{ fontSize:9, fontWeight:600 }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main style={{ marginLeft:sidebarW, padding:'32px', minHeight:'100vh' }} className="main-content">

        {/* ── TAB: DASHBOARD ── */}
        {tab==='dashboard' && (
          <div className="anim-fade">
            <style>{`@media(max-width:1024px){.dash-cols{grid-template-columns:1fr!important}}`}</style>

            {/* Greeting */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
              <div>
                <h1 style={{ fontFamily:T.fontSerif, fontSize:28, color:T.dark, margin:'0 0 4px' }}>
                  Olá, {profile?.name?.split(' ')[0]} 👋
                </h1>
                <p style={{ fontSize:14, color:T.muted, margin:0 }}>
                  {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", {locale:ptBR})}
                </p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                {pending.length > 0 && <span style={{ background:T.amberL, color:T.amber, border:`1px solid ${T.amberB}`, fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:T.r100, display:'flex', alignItems:'center', gap:5 }}><Bell size={11}/>{pending.length} pendente{pending.length>1?'s':''}</span>}
                <span style={{ background:T.sageG, color:T.sage, border:`1px solid ${T.sageP}`, fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:T.r100 }}>{profile?.plan==='premium'?'💎 Premium':'🌿 Basic'}</span>
              </div>
            </div>

            {/* KPI row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:14, marginBottom:24 }}>
              {[
                { icon:'📅', label:'Hoje',           value:String(todayAppts.length),   sub:'agendamentos',        color:T.sage  },
                { icon:'👥', label:'Pacientes',       value:String(totalClients),         sub:'cadastrados',         color:T.blue  },
                { icon:'⏳', label:'Próxima',         value:nextAppt?nextAppt.appt_time.slice(0,5):'—', sub:nextAppt?nextAppt.client_name.split(' ')[0]:'sem consulta', color:T.amber },
                { icon:'⭐', label:'Confirmações',    value:`${confirmRate}%`,            sub:'taxa de confirmação', color:'#7c3aed' },
                { icon:'🔥', label:'Novos',           value:String(newPatientsMonth),     sub:'pacientes este mês',  color:T.red   },
                { icon:'👁️', label:'Visualizações',  value:'—',                          sub:'analytics em breve',  color:T.muted },
              ].map(c=>(
                <div key={c.label} style={{ background:T.white, borderRadius:T.r20, padding:'18px 20px', boxShadow:T.shadowCard }}>
                  <div style={{ fontSize:20, marginBottom:8 }}>{c.icon}</div>
                  <p style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>{c.label}</p>
                  <p style={{ fontSize:28, fontWeight:800, color:T.dark, margin:'5px 0 2px', lineHeight:1 }}>{c.value}</p>
                  <p style={{ fontSize:11, color:c.color, fontWeight:500, margin:0 }}>{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Two-column layout */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' }} className="dash-cols">

              {/* LEFT: Timeline + Próximos 7 dias */}
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

                {/* Timeline de hoje */}
                <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.nude}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h2 style={{ fontFamily:T.fontSerif, fontSize:18, color:T.dark, margin:0 }}>Agenda de hoje</h2>
                    <span style={{ background:T.sageG, color:T.sage, fontSize:11, fontWeight:700, padding:'4px 11px', borderRadius:T.r100, border:`1px solid ${T.sageP}` }}>{todayAppts.length} consulta{todayAppts.length!==1?'s':''}</span>
                  </div>
                  <div style={{ padding:'20px' }}>
                    {todayAppts.length === 0 ? (
                      <div style={{ padding:'24px', textAlign:'center', color:T.muted }}>
                        <div style={{ fontSize:36, marginBottom:8 }}>📅</div>
                        <p style={{ fontWeight:600, color:T.dark, margin:'0 0 4px' }}>Dia livre!</p>
                        <p style={{ fontSize:13, margin:'0 0 12px' }}>Nenhuma consulta hoje.</p>
                        {profile && <Link href={`/p/${profile.slug}`} target="_blank" style={{ color:T.sage, fontSize:13, fontWeight:600 }}>Ver minha página →</Link>}
                      </div>
                    ) : (
                      <div style={{ position:'relative' }}>
                        <div style={{ position:'absolute', left:19, top:20, bottom:20, width:2, background:T.nude, borderRadius:1 }}/>
                        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                          {todayAppts.map(a=>{
                            const sc = ({
                              confirmed:{ color:T.sage,  bg:T.sageG,  label:'Confirmado' },
                              pending:  { color:T.amber, bg:T.amberL, label:'Aguardando' },
                              completed:{ color:T.blue,  bg:T.blueL,  label:'Concluído'  },
                              cancelled:{ color:T.red,   bg:T.redL,   label:'Cancelado'  },
                            } as any)[a.status] || { color:T.muted, bg:T.off, label:a.status }
                            return (
                              <div key={a.id} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                                <div style={{ width:40, height:40, borderRadius:'50%', background:sc.bg, border:`2.5px solid ${sc.color}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1, position:'relative' }}>
                                  <span style={{ fontSize:10, fontWeight:800, color:sc.color, textAlign:'center', lineHeight:1 }}>{a.appt_time.slice(0,5)}</span>
                                </div>
                                <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:6 }}>
                                  <div style={{ background:T.off, borderRadius:T.r14, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <p style={{ fontWeight:700, fontSize:14, color:T.dark, margin:0 }}>{a.client_name}</p>
                                      <p style={{ fontSize:11, color:T.muted, margin:0 }}>{a.client_phone}</p>
                                    </div>
                                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:T.r100, background:sc.bg, color:sc.color, flexShrink:0 }}>{sc.label}</span>
                                    {a.status==='pending' && (
                                      <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                                        <button onClick={()=>updateStatus(a.id,'confirmed')} style={{ background:T.sage, color:T.cream, border:'none', borderRadius:T.r8, padding:'5px 10px', cursor:'pointer', fontSize:12, fontWeight:600 }}>✓ Confirmar</button>
                                        <button onClick={()=>updateStatus(a.id,'cancelled')} style={{ background:T.redL, color:T.red, border:'none', borderRadius:T.r8, padding:'5px 10px', cursor:'pointer', fontSize:12, fontWeight:600 }}>✗</button>
                                      </div>
                                    )}
                                    {a.status==='confirmed' && (
                                      <button onClick={()=>updateStatus(a.id,'completed')} style={{ background:T.blueL, color:T.blue, border:'none', borderRadius:T.r8, padding:'5px 10px', cursor:'pointer', fontSize:11, fontWeight:600, flexShrink:0 }}>Concluir</button>
                                    )}
                                  </div>
                                  {notifErrors[a.id] && (
                                    <div style={{ padding:'8px 12px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:T.r10, fontSize:12, color:'#DC2626', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                                      <span>⚠ Falha ao notificar: {notifErrors[a.id]}</span>
                                      <button onClick={()=>retryNotification(a.id)} style={{ background:T.red, color:'#fff', border:'none', borderRadius:T.r8, padding:'4px 10px', cursor:'pointer', fontSize:11, fontWeight:700, flexShrink:0 }}>Tentar novamente</button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Próximos 7 dias */}
                <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.nude}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h2 style={{ fontFamily:T.fontSerif, fontSize:18, color:T.dark, margin:0 }}>Próximos 7 dias</h2>
                    <span style={{ fontSize:11, color:T.muted, fontWeight:500 }}>{upcomingAppts.length} agendamento{upcomingAppts.length!==1?'s':''}</span>
                  </div>
                  {upcomingAppts.length === 0 ? (
                    <div style={{ padding:'32px', textAlign:'center', color:T.muted }}>
                      <div style={{ fontSize:32, marginBottom:6 }}>🗓️</div>
                      <p style={{ fontSize:13, margin:0, fontWeight:500 }}>Nenhum agendamento nos próximos dias.</p>
                    </div>
                  ) : (() => {
                    const byDate = new Map<string, Appointment[]>()
                    upcomingAppts.forEach(a => { if (!byDate.has(a.appt_date)) byDate.set(a.appt_date, []); byDate.get(a.appt_date)!.push(a) })
                    return Array.from(byDate.entries()).map(([date, appts]) => (
                      <div key={date}>
                        <div style={{ padding:'7px 20px 4px', fontSize:10, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em', background:`${T.off}80`, borderBottom:`1px solid ${T.nude}` }}>
                          {format(new Date(date+'T12:00'),"dd 'de' MMMM",{locale:ptBR})}
                        </div>
                        {appts.map(a=>(
                          <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:`1px solid ${T.nude}` }}>
                            <div style={{ background:T.sageG, color:T.sage, fontSize:12, fontWeight:700, padding:'5px 10px', borderRadius:T.r10, flexShrink:0, minWidth:46, textAlign:'center' }}>{a.appt_time.slice(0,5)}</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontWeight:600, fontSize:13, color:T.dark, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.client_name}</p>
                              <p style={{ fontSize:11, color:T.muted, margin:0 }}>{a.client_phone}</p>
                            </div>
                            <StatusBadge status={a.status}/>
                          </div>
                        ))}
                      </div>
                    ))
                  })()}
                </div>

              </div>

              {/* RIGHT: Atalhos + Página + Avisos */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

                {/* Atalhos rápidos */}
                <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:'16px 20px' }}>
                  <h3 style={{ fontFamily:T.fontSerif, fontSize:15, color:T.dark, margin:'0 0 14px' }}>Atalhos rápidos</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[
                      { icon:'📅', label:'Nova consulta',   fn:()=>setTab('agenda')    },
                      { icon:'👥', label:'Ver clientes',    fn:()=>setTab('clientes')  },
                      { icon:'🚫', label:'Bloquear agenda', fn:()=>setTab('horarios')  },
                      { icon:'👤', label:'Editar perfil',   fn:()=>setTab('perfil')    },
                      { icon:'🔗', label:'Copiar link',     fn:()=>{ if(profile) navigator.clipboard.writeText(`${window.location.origin}/p/${profile.slug}`).then(()=>setToast('🔗 Link copiado!')).catch(()=>{}) } },
                      { icon:'🌐', label:'Abrir página',    fn:()=>{ if(profile) window.open(`/p/${profile.slug}`,'_blank') } },
                    ].map(a=>(
                      <button key={a.label} onClick={a.fn}
                        style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:5, padding:'12px', background:T.off, border:`1px solid ${T.nude}`, borderRadius:T.r14, cursor:'pointer', fontFamily:T.fontSans, transition:'all 0.15s' }}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=T.sageG;(e.currentTarget as HTMLElement).style.borderColor=T.sageP}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=T.off;(e.currentTarget as HTMLElement).style.borderColor=T.nude}}>
                        <span style={{ fontSize:18 }}>{a.icon}</span>
                        <span style={{ fontSize:11, fontWeight:600, color:T.dark, lineHeight:1.3 }}>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sua página */}
                <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.nude}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <h3 style={{ fontFamily:T.fontSerif, fontSize:15, color:T.dark, margin:0 }}>Sua página</h3>
                      {profile && (
                        <Link href={`/p/${profile.slug}`} target="_blank" style={{ fontSize:11, color:T.sage, fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>
                          Ver <ExternalLink size={11}/>
                        </Link>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                      <div style={{ flex:1, height:6, background:T.nude, borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${completionPct}%`, background:completionPct===100?T.sage:T.amber, borderRadius:3, transition:'width 0.4s' }}/>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:completionPct===100?T.sage:T.amber, flexShrink:0 }}>{completionPct}%</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      {[
                        { label:'Agendamentos', value:String(appointments.length), icon:'📅' },
                        { label:'Clientes',     value:String(totalClients),        icon:'👥' },
                        { label:'Visualizações',value:'—',                         icon:'👁️' },
                        { label:'WhatsApp',     value:'—',                         icon:'📱' },
                      ].map(s=>(
                        <div key={s.label} style={{ background:T.off, borderRadius:T.r12, padding:'9px 11px' }}>
                          <p style={{ fontSize:10, color:T.muted, fontWeight:600, margin:0 }}>{s.icon} {s.label}</p>
                          <p style={{ fontSize:18, fontWeight:800, color:T.dark, margin:'3px 0 0', lineHeight:1 }}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Checklist */}
                  <div style={{ padding:'12px 20px' }}>
                    <p style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 10px' }}>Checklist do perfil</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {profileChecks.map(c=>(
                        <div key={c.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                          {c.done
                            ? <CheckCircle size={14} color={T.sage}/>
                            : <XCircle size={14} color={T.nude}/>}
                          <span style={{ fontSize:12, color:c.done?T.dark:T.muted }}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Avisos inteligentes */}
                {alerts.length > 0 && (
                  <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:'16px 20px' }}>
                    <h3 style={{ fontFamily:T.fontSerif, fontSize:15, color:T.dark, margin:'0 0 12px', display:'flex', alignItems:'center', gap:7 }}>
                      <Bell size={14} style={{color:T.amber}}/> Avisos
                    </h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {alerts.map((al,i)=>(
                        <div key={i} style={{ display:'flex', gap:8, padding:'9px 12px', background:T.amberL, border:`1px solid ${T.amberB}`, borderRadius:T.r12 }}>
                          <span style={{ fontSize:12, flexShrink:0 }}>⚠️</span>
                          <span style={{ fontSize:12, color:T.amber, fontWeight:500, lineHeight:1.4 }}>{al}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ── TAB: AGENDA ── */}
        {tab==='agenda' && (
          <div className="anim-fade">
            <h1 style={{ fontFamily:T.fontSerif, fontSize:28, color:T.dark, marginBottom:20 }}>Agenda completa</h1>
            <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden' }}>
              {appointments.length === 0 ? (
                <div style={{ padding:'64px 24px', textAlign:'center' }}>
                  <p style={{ fontSize:40, marginBottom:12 }}>📅</p>
                  <p style={{ fontWeight:600, color:T.dark }}>Nenhum agendamento ainda</p>
                  {profile && <Link href={`/p/${profile.slug}`} target="_blank" style={{ color:T.sage, fontSize:13, fontWeight:600 }}>Ver minha página →</Link>}
                </div>
              ) : appointments.map(a=>(
                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:`1px solid ${T.nude}` }}>
                  <div style={{ textAlign:'center', minWidth:52 }}>
                    <p style={{ fontSize:10, color:T.muted, margin:0, fontWeight:600 }}>{DAYS[new Date(a.appt_date+'T12:00').getDay()]}</p>
                    <p style={{ fontWeight:800, fontSize:20, color:T.dark, margin:'2px 0' }}>{a.appt_date.split('-')[2]}</p>
                    <p style={{ fontSize:11, color:T.sage, fontWeight:700, margin:0 }}>{a.appt_time.slice(0,5)}</p>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:14, color:T.dark, margin:0 }}>{a.client_name}</p>
                    <p style={{ fontSize:12, color:T.muted, margin:0 }}>{a.client_phone}{a.client_email?` · ${a.client_email}`:''}</p>
                    {a.notes && <p style={{ fontSize:12, color:T.mid, fontStyle:'italic', margin:'2px 0 0' }}>"{a.notes}"</p>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <StatusBadge status={a.status}/>
                    {a.status==='pending' && <>
                      <button onClick={()=>updateStatus(a.id,'confirmed')} style={{ background:T.sage, color:T.cream, border:'none', borderRadius:T.r10, padding:'6px 11px', cursor:'pointer', fontSize:12, fontWeight:600 }}>✓</button>
                      <button onClick={()=>updateStatus(a.id,'cancelled')} style={{ background:T.redL, color:T.red, border:'none', borderRadius:T.r10, padding:'6px 11px', cursor:'pointer', fontSize:12, fontWeight:600 }}>✗</button>
                    </>}
                    {a.status==='confirmed' && <button onClick={()=>updateStatus(a.id,'completed')} style={{ background:T.blueL, color:T.blue, border:'none', borderRadius:T.r10, padding:'6px 11px', cursor:'pointer', fontSize:12, fontWeight:600 }}>Concluir</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: CLIENTES ── */}
        {tab==='clientes' && (
          <div className="anim-fade">
            <h1 style={{ fontFamily:T.fontSerif, fontSize:28, color:T.dark, marginBottom:20 }}>
              Clientes <span style={{ fontSize:18, color:T.muted, fontWeight:400 }}>({new Set(appointments.map(a=>a.client_phone)).size})</span>
            </h1>
            <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden' }}>
              {(() => {
                const map = new Map<string, Appointment[]>()
                appointments.forEach(a => { if (!map.has(a.client_phone)) map.set(a.client_phone, []); map.get(a.client_phone)!.push(a) })
                const clients = Array.from(map.entries())
                if (!clients.length) return <div style={{ padding:'64px', textAlign:'center', color:T.muted }}>Nenhum cliente ainda.</div>
                return clients.map(([phone, appts]) => (
                  <div key={phone} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 20px', borderBottom:`1px solid ${T.nude}` }}>
                    <div style={{ width:42, height:42, borderRadius:'50%', background:T.sageG, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:T.sage, fontSize:16, flexShrink:0 }}>
                      {appts[0].client_name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, fontSize:14, color:T.dark, margin:0 }}>{appts[0].client_name}</p>
                      <p style={{ fontSize:12, color:T.muted, margin:0 }}>{phone}{appts[0].client_email?` · ${appts[0].client_email}`:''}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontWeight:700, fontSize:18, color:T.dark, margin:0 }}>{appts.length}</p>
                      <p style={{ fontSize:11, color:T.muted, margin:0 }}>consulta{appts.length!==1?'s':''}</p>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}

        {/* ── TAB: HORÁRIOS ── */}
        {tab==='horarios' && <AvailabilityTab profile={profile}/>}

        {/* ── TAB: PERFIL ── */}
        {tab==='perfil' && <ProfileTab profile={profile} onSave={load}/>}
      </main>
    </div>
  )
}

function AvailabilityTab({ profile }: { profile: Profile|null }) {
  const DAYS_FULL = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
  const [avail,     setAvail]     = useState<{day:number,start:string,end:string}[]>([])
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [blocks,    setBlocks]    = useState<AgendaBlock[]>([])
  const [blockMsg,  setBlockMsg]  = useState('')
  // intervals: one per weekday — present key = enabled
  const [intervals, setIntervals] = useState<Record<number,{start:string,end:string}>>({})
  const [expDays,   setExpDays]   = useState<Set<number>>(new Set())
  const [brkErrors, setBrkErrors] = useState<Record<number,string>>({})

  useEffect(() => {
    if (!profile) return
    supabase.from('availability').select('*').eq('professional_id',profile.id).eq('active',true)
      .then(({data}) => { if(data) setAvail(data.map(d=>({day:d.day_of_week,start:d.start_time,end:d.end_time}))) })
    supabase.from('agenda_blocks').select('*').eq('professional_id',profile.id).order('data_inicial',{ascending:true})
      .then(({data}) => { if(data) setBlocks(data as AgendaBlock[]) })
    supabase.from('schedule_breaks').select('*').eq('professional_id',profile.id).order('weekday').order('start_time')
      .then(({data}) => {
        if (data) {
          const m: Record<number,{start:string,end:string}> = {}
          // one interval per day — take first row per weekday
          data.forEach(b => { if (!(b.weekday in m)) m[b.weekday] = { start: b.start_time.slice(0,5), end: b.end_time.slice(0,5) } })
          setIntervals(m)
        }
      })
  }, [profile])

  function toggle(d: number) {
    const active = avail.some(a => a.day === d)
    if (active) {
      setAvail(p => p.filter(a => a.day !== d))
      setIntervals(p => { const n = {...p}; delete n[d]; return n })
      setExpDays(p => { const n = new Set(p); n.delete(d); return n })
      setBrkErrors(p => { const n = {...p}; delete n[d]; return n })
    } else {
      setAvail(p => [...p, {day:d, start:'08:00', end:'18:00'}].sort((a,b) => a.day - b.day))
    }
  }

  function upd(d: number, k: string, v: string) { setAvail(p => p.map(a => a.day===d ? {...a,[k]:v} : a)) }

  function toggleExp(d: number) {
    const willExpand = !expDays.has(d)
    // Auto-initialize with defaults when opening for the first time on this day
    if (willExpand && !(d in intervals)) {
      setIntervals(p => ({...p, [d]: {start:'12:00', end:'13:00'}}))
    }
    setExpDays(p => { const n = new Set(p); n.has(d) ? n.delete(d) : n.add(d); return n })
  }

  function updInterval(d: number, k: 'start'|'end', v: string) {
    setIntervals(p => ({...p, [d]: {...(p[d]||{start:'12:00',end:'13:00'}), [k]:v}}))
    if (brkErrors[d]) setBrkErrors(p => { const n={...p}; delete n[d]; return n })
  }

  function removeInterval(d: number) {
    setIntervals(p => { const n = {...p}; delete n[d]; return n })
    setExpDays(p => { const n = new Set(p); n.delete(d); return n })
    setBrkErrors(p => { const n = {...p}; delete n[d]; return n })
  }

  async function save() {
    if (!profile) return

    // Validate intervals
    const toMins = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m }
    const errors: Record<number,string> = {}
    for (const a of avail) {
      const iv = intervals[a.day]
      if (!iv) continue
      const ws = toMins(a.start), we = toMins(a.end)
      const bs = toMins(iv.start), be = toMins(iv.end)
      if (bs >= be) { errors[a.day] = 'O início do intervalo deve ser anterior ao fim'; continue }
      if (bs < ws || be > we) { errors[a.day] = 'O intervalo deve estar dentro do horário de trabalho'; continue }
      if (be - bs >= we - ws) errors[a.day] = 'O intervalo não pode ser maior que o horário de trabalho'
    }
    if (Object.keys(errors).length > 0) { setBrkErrors(errors); return }
    setBrkErrors({})

    setSaving(true)
    await supabase.from('availability').delete().eq('professional_id', profile.id)
    if (avail.length) await supabase.from('availability').insert(
      avail.map(a => ({professional_id:profile.id, day_of_week:a.day, start_time:a.start, end_time:a.end, slot_minutes:60}))
    )

    await supabase.from('schedule_breaks').delete().eq('professional_id', profile.id)
    const brkRows = avail
      .filter(a => intervals[a.day])
      .map(a => ({professional_id:profile.id, weekday:a.day, start_time:intervals[a.day].start, end_time:intervals[a.day].end, description:'Intervalo'}))
    if (brkRows.length) await supabase.from('schedule_breaks').insert(brkRows)

    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  async function addBlock(b: AgendaBlock) {
    if (!profile) return
    const { data, error } = await supabase.from('agenda_blocks').insert({ ...b, professional_id: profile.id }).select().single()
    if (!error && data) {
      setBlocks(prev => [...prev, data as AgendaBlock].sort((a,b) => a.data_inicial.localeCompare(b.data_inicial)))
      setBlockMsg('Bloqueio adicionado!'); setTimeout(() => setBlockMsg(''), 2500)
    }
  }

  async function removeBlock(id: string, index: number) {
    if (!profile) return
    if (id) await supabase.from('agenda_blocks').delete().eq('id', id)
    setBlocks(prev => prev.filter((_,i) => i !== index))
  }

  const th = { primary:T.sage, glow:T.sageG, pale:T.sageP }

  return (
    <div className="anim-fade">
      <h1 style={{ fontFamily:T.fontSerif, fontSize:28, color:T.dark, marginBottom:6 }}>Horários de atendimento</h1>
      <p style={{ fontSize:14, color:T.muted, marginBottom:24 }}>Configure os dias, horários e intervalos disponíveis para agendamento.</p>

      {/* Availability days */}
      <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:24, marginBottom:20 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          {DAYS_FULL.map((day, i) => {
            const a = avail.find(x => x.day === i)
            const iv = intervals[i]
            const isExp = expDays.has(i)
            return (
              <div key={day} style={{ borderRadius:T.r14, border:`2px solid ${a?T.sageP:T.nude}`, background:a?T.sageG:T.off, transition:'all 0.15s', overflow:'hidden' }}>

                {/* Main row */}
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', flexWrap:'wrap' }}>
                  <button type="button" onClick={() => toggle(i)}
                    style={{ width:22, height:22, borderRadius:T.r4, border:`2px solid ${a?T.sage:T.nude}`, background:a?T.sage:T.white, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'all 0.15s' }}>
                    {a && <span style={{ color:T.cream, fontSize:12, fontWeight:700 }}>✓</span>}
                  </button>
                  <span style={{ fontSize:14, fontWeight:600, color:a?T.dark:T.muted, width:80, flexShrink:0 }}>{day}</span>

                  {a ? (
                    <>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flex:1, flexWrap:'wrap', minWidth:160 }}>
                        <input type="time" value={a.start} onChange={e => upd(i,'start',e.target.value)}
                          style={{ border:`1px solid ${T.sageP}`, background:T.white, borderRadius:T.r10, padding:'7px 12px', fontSize:13, outline:'none', color:T.dark, fontFamily:T.fontSans }}/>
                        <span style={{ fontSize:12, color:T.muted }}>até</span>
                        <input type="time" value={a.end} onChange={e => upd(i,'end',e.target.value)}
                          style={{ border:`1px solid ${T.sageP}`, background:T.white, borderRadius:T.r10, padding:'7px 12px', fontSize:13, outline:'none', color:T.dark, fontFamily:T.fontSans }}/>
                      </div>
                      {/* ⏸ Intervalo toggle */}
                      <button type="button" onClick={() => toggleExp(i)}
                        style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:T.r10, border:`1.5px solid ${iv?T.sage:T.sageP}`, background:iv?T.sageG:T.white, color:iv?T.sage:T.muted, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:T.fontSans, flexShrink:0, whiteSpace:'nowrap', transition:'all 0.15s' }}>
                        ⏸ {iv ? `${iv.start}–${iv.end}` : 'Intervalo'} {isExp ? '▲' : '▼'}
                      </button>
                    </>
                  ) : <span style={{ fontSize:13, color:T.muted, fontStyle:'italic' }}>Clique para ativar</span>}
                </div>

                {/* Interval panel — shown when expanded */}
                {a && isExp && (
                  <div style={{ padding:'12px 16px 14px', borderTop:`1px solid ${T.sageP}` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.06em', margin:0 }}>
                        Intervalo — {day}
                      </p>
                      {iv && (
                        <button type="button" onClick={() => removeInterval(i)}
                          style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:T.muted, fontSize:11, padding:'2px 4px', fontFamily:T.fontSans, transition:'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = T.red}
                          onMouseLeave={e => e.currentTarget.style.color = T.muted}>
                          <X size={11}/> Remover intervalo
                        </button>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:10, flexWrap:'wrap' }}>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>Início</label>
                        <input type="time" value={iv?.start ?? '12:00'} onChange={e => updInterval(i,'start',e.target.value)}
                          style={{ border:`1.5px solid ${brkErrors[i]?T.red:T.sageP}`, background:T.white, borderRadius:T.r10, padding:'7px 12px', fontSize:13, outline:'none', color:T.dark, fontFamily:T.fontSans }}/>
                      </div>
                      <span style={{ fontSize:12, color:T.muted, paddingBottom:10 }}>até</span>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>Fim</label>
                        <input type="time" value={iv?.end ?? '13:00'} onChange={e => updInterval(i,'end',e.target.value)}
                          style={{ border:`1.5px solid ${brkErrors[i]?T.red:T.sageP}`, background:T.white, borderRadius:T.r10, padding:'7px 12px', fontSize:13, outline:'none', color:T.dark, fontFamily:T.fontSans }}/>
                      </div>
                    </div>
                    {brkErrors[i] && (
                      <p style={{ fontSize:12, color:T.red, margin:'8px 0 0', fontWeight:500 }}>⚠ {brkErrors[i]}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <button onClick={save} disabled={saving}
          style={{ width:'100%', padding:'14px', fontSize:15, fontWeight:700, color:T.cream, background:saved?T.sage:T.dark, border:'none', borderRadius:T.r14, cursor:'pointer', fontFamily:T.fontSans, transition:'background 0.2s' }}>
          {saved ? '✓ Horários salvos!' : saving ? 'Salvando...' : 'Salvar horários'}
        </button>
      </div>

      {/* Agenda blocks */}
      <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:24 }}>
        <AgendaBlocksSection blocks={blocks} onAdd={addBlock} onRemove={removeBlock} theme={th}/>
        {blockMsg && (
          <div style={{ marginTop:12, padding:'10px 14px', background:T.sageG, border:`1px solid ${T.sageP}`, borderRadius:T.r10, fontSize:13, color:T.sage, fontWeight:600 }}>
            ✓ {blockMsg}
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileTab({ profile, onSave }: { profile: Profile|null, onSave:()=>void }) {
  const [form, setForm] = useState({ name:'', bio:'', whatsapp:'', city:'', state:'', specialties:'', crm:'', instagram:'' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [photo, setPhoto] = useState('')

  useEffect(() => {
    if (!profile) return
    setForm({ name:profile.name||'', bio:profile.bio||'', whatsapp:profile.whatsapp||'', city:profile.city||'', state:profile.state||'', specialties:(profile.specialties||[]).join(', '), crm:profile.crm_cro_crp||'', instagram:profile.instagram||'' })
    setPhoto(profile.photo_url||'')
  }, [profile])

  async function uploadPhoto(file: File): Promise<string> {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method:'POST', body:fd })
    const { url } = await res.json()
    if (!url) throw new Error('Não foi possível enviar a foto. Tente novamente.')
    return url
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!profile) return; setSaving(true)
    await supabase.from('profiles').update({ name:form.name, bio:form.bio, whatsapp:form.whatsapp, city:form.city, state:form.state, crm_cro_crp:form.crm, instagram:form.instagram, specialties:form.specialties ? form.specialties.split(',').map((s:string)=>s.trim()).filter(Boolean) : [] }).eq('id',profile.id)
    setSaving(false); setSaved(true); onSave(); setTimeout(()=>setSaved(false),2500)
  }

  function upd(k:string,v:string) { setForm(f=>({...f,[k]:v})) }

  return (
    <div className="anim-fade">
      <h1 style={{ fontFamily:T.fontSerif, fontSize:28, color:T.dark, marginBottom:6 }}>Meu perfil</h1>
      <p style={{ fontSize:14, color:T.muted, marginBottom:24 }}>Essas informações aparecem na sua página pública.</p>

      {/* Photo */}
      <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:24, marginBottom:20 }}>
        <PhotoCropper
          value={photo}
          onChange={setPhoto}
          onUpload={uploadPhoto}
        />
      </div>

      {/* Form */}
      <form onSubmit={save} style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:24 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[['name','Nome completo','Dra. Ana Beatriz Silva'],['crm','CRM / CRO / CRP','CRP 06/12345'],['whatsapp','WhatsApp','(11) 99999-9999'],['instagram','Instagram','@usuario'],['city','Cidade','São Paulo'],['state','Estado','SP']].map(([k,l,p])=>(
            <div key={k} style={{ gridColumn: ['city','state'].includes(k)?undefined:undefined }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>{l}</label>
              <InputF value={(form as any)[k]} onChange={(v:string)=>upd(k,v)} placeholder={p} maxLen={k==='state'?2:undefined}/>
            </div>
          ))}
        </div>
        <div style={{ marginTop:4 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:10 }}>Especialidades</label>
          <div style={{ background:T.off, borderRadius:T.r12, padding:'16px', border:`1px solid ${T.nude}` }}>
            <DynamicSpecialties
              profession={profile?.profession || ''}
              value={form.specialties ? form.specialties.split(',').map((s:string)=>s.trim()).filter(Boolean) : []}
              onChange={specs => upd('specialties', specs.join(', '))}
            />
          </div>
        </div>
        <div style={{ marginTop:4 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>Bio</label>
          <textarea rows={4} value={form.bio} onChange={e=>upd('bio',e.target.value)}
            style={{ width:'100%', padding:'12px 16px', fontSize:14, color:T.dark, background:T.off, border:`2px solid ${T.nude}`, borderRadius:T.r12, outline:'none', resize:'vertical', fontFamily:T.fontSans, transition:'border-color 0.2s' }}
            onFocus={e=>e.target.style.borderColor=T.sage} onBlur={e=>e.target.style.borderColor=T.nude}/>
        </div>
        <button type="submit" disabled={saving} style={{ marginTop:20, width:'100%', padding:'14px', fontSize:15, fontWeight:700, color:T.cream, background:saved?T.sage:T.dark, border:'none', borderRadius:T.r14, cursor:'pointer', fontFamily:T.fontSans, transition:'background 0.2s' }}>
          {saved ? '✓ Perfil salvo!' : saving ? 'Salvando...' : 'Salvar perfil'}
        </button>
      </form>

      {profile && (
        <div style={{ marginTop:16, background:T.sageG, border:`1px solid ${T.sageP}`, borderRadius:T.r16, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontWeight:600, color:T.sage, fontSize:14, margin:0 }}>Sua página pública</p>
            <p style={{ fontSize:12, color:T.mid, margin:0 }}>organizaplusapp.com.br/p/{profile.slug}</p>
          </div>
          <Link href={`/p/${profile.slug}`} target="_blank" style={{ display:'flex', alignItems:'center', gap:5, color:T.sage, fontSize:13, fontWeight:600, textDecoration:'none' }}>
            Ver <ExternalLink size={13}/>
          </Link>
        </div>
      )}
    </div>
  )
}

function InputF({ value, onChange, placeholder, maxLen }: { value:string, onChange:(v:string)=>void, placeholder?:string, maxLen?:number }) {
  const [f,setF] = useState(false)
  return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} maxLength={maxLen}
    style={{ width:'100%', padding:'12px 16px', fontSize:14, color:T.dark, background:T.off, border:`2px solid ${f?T.sage:T.nude}`, borderRadius:T.r12, outline:'none', fontFamily:T.fontSans, transition:'border-color 0.2s' }}
    onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
}

export default function Dashboard() {
  return <Suspense fallback={<div style={{ minHeight:'100vh', background:T.off }}/>}><DashboardContent/></Suspense>
}
