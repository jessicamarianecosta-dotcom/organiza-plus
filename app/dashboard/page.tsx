'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase, Profile, Appointment } from '@/lib/supabase'
import { T, GlobalStyles, Btn, Badge, Input, Alert, ProgressBar } from '@/lib/ds'
import { LayoutDashboard, Calendar, Users, Clock, Settings, Globe, LogOut, TrendingUp, CreditCard, ExternalLink, CheckCircle, XCircle, X, Menu, ChevronRight, Bell, Upload } from 'lucide-react'

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

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!p) { router.push('/onboarding'); return }
    if (!(p as any).onboarding_done) { router.push('/onboarding'); return }
    setProfile(p)
    const { data: a } = await supabase.from('appointments').select('*').eq('professional_id', user.id).order('appt_date',{ascending:true}).order('appt_time',{ascending:true}).limit(100)
    setAppointments(a || [])
    setLoading(false)
    if (params.get('payment') === 'success') setToast('🎉 Pagamento confirmado! Plano ativado.')
  }, [router, params])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string) {
    await supabase.from('appointments').update({status}).eq('id',id)
    setAppointments(prev => prev.map(a => a.id===id ? {...a, status: status as any} : a))
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

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appointments.filter(a => a.appt_date === today)
  const pending = appointments.filter(a => a.status === 'pending')
  const totalClients = new Set(appointments.map(a => a.client_phone)).size

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
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, flexWrap:'wrap', gap:12 }}>
              <div>
                <h1 style={{ fontFamily:T.fontSerif, fontSize:28, color:T.dark, margin:'0 0 4px' }}>
                  Olá, {profile?.name?.split(' ')[0]} 👋
                </h1>
                <p style={{ fontSize:14, color:T.muted }}>
                  {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", {locale:ptBR})}
                </p>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {pending.length > 0 && (
                  <span style={{ background:T.amberL, color:T.amber, border:`1px solid ${T.amberB}`, fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:T.r100 }}>
                    <Bell size={11} style={{ display:'inline', marginRight:5 }}/>{pending.length} pendente{pending.length>1?'s':''}
                  </span>
                )}
                <span style={{ background:T.sageG, color:T.sage, border:`1px solid ${T.sageP}`, fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:T.r100 }}>
                  {profile?.plan==='premium'?'💎 Premium':'🌿 Basic'}
                </span>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:24 }}>
              {[
                { icon:'📅', label:'Hoje',       value:String(todayAppts.length), sub:'agendamentos', color:T.sage },
                { icon:'👥', label:'Clientes',    value:String(totalClients),       sub:'no total',     color:T.blue },
                { icon:'⏳', label:'Pendentes',   value:String(pending.length),     sub:'aguardando',   color:T.amber },
                { icon:'✅', label:'Concluídos',  value:String(appointments.filter(a=>a.status==='completed').length), sub:'no total', color:T.green },
              ].map(c=>(
                <div key={c.label} style={{ background:T.white, borderRadius:T.r20, padding:'20px', boxShadow:T.shadowCard }}>
                  <div style={{ fontSize:22, marginBottom:10 }}>{c.icon}</div>
                  <p style={{ fontSize:10, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>{c.label}</p>
                  <p style={{ fontSize:30, fontWeight:800, color:T.dark, margin:'5px 0 2px', lineHeight:1 }}>{c.value}</p>
                  <p style={{ fontSize:11, color:c.color, fontWeight:500, margin:0 }}>{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Pending alert */}
            {pending.length > 0 && (
              <div style={{ background:T.amberL, border:`1px solid ${T.amberB}`, borderRadius:T.r20, padding:'18px 20px', marginBottom:20 }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.amber, margin:'0 0 12px', display:'flex', alignItems:'center', gap:8 }}>
                  <Bell size={15}/> {pending.length} agendamento{pending.length>1?'s':''} aguardando confirmação
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {pending.slice(0,3).map(a=>(
                    <div key={a.id} style={{ background:T.white, borderRadius:T.r12, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, boxShadow:T.shadowSm }}>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:700, fontSize:14, color:T.dark, margin:0 }}>{a.client_name}</p>
                        <p style={{ fontSize:12, color:T.muted, margin:0 }}>{a.appt_date} às {a.appt_time.slice(0,5)}</p>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={()=>updateStatus(a.id,'confirmed')} style={{ display:'flex', alignItems:'center', gap:5, background:T.sage, color:T.cream, border:'none', borderRadius:T.r10, padding:'7px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                          <CheckCircle size={13}/> Confirmar
                        </button>
                        <button onClick={()=>updateStatus(a.id,'cancelled')} style={{ display:'flex', alignItems:'center', gap:5, background:T.redL, color:T.red, border:'none', borderRadius:T.r10, padding:'7px 12px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                          <XCircle size={13}/> Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's appointments */}
            <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.nude}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, margin:0 }}>Agendamentos de hoje</h2>
                <span style={{ background:T.sageG, color:T.sage, fontSize:11, fontWeight:700, padding:'4px 11px', borderRadius:T.r100, border:`1px solid ${T.sageP}` }}>
                  {todayAppts.length} hoje
                </span>
              </div>
              {todayAppts.length === 0 ? (
                <div style={{ padding:'48px 24px', textAlign:'center', color:T.muted }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
                  <p style={{ fontWeight:600, color:T.dark, marginBottom:4 }}>Nenhum agendamento hoje</p>
                  <p style={{ fontSize:13 }}>Compartilhe sua página pública para receber mais clientes.</p>
                  {profile && <Link href={`/p/${profile.slug}`} target="_blank" style={{ color:T.sage, fontSize:13, fontWeight:600, marginTop:8, display:'inline-block' }}>Ver minha página →</Link>}
                </div>
              ) : todayAppts.map(a=>(
                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:`1px solid ${T.nude}` }}>
                  <div style={{ background:T.sageG, color:T.sage, fontSize:12, fontWeight:700, padding:'6px 10px', borderRadius:T.r10, flexShrink:0, minWidth:52, textAlign:'center' }}>
                    {a.appt_time.slice(0,5)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:600, fontSize:14, color:T.dark, margin:0 }}>{a.client_name}</p>
                    <p style={{ fontSize:12, color:T.muted, margin:0 }}>{a.client_phone}</p>
                  </div>
                  <StatusBadge status={a.status}/>
                  {a.status==='pending' && (
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>updateStatus(a.id,'confirmed')} style={{ background:T.sage, color:T.cream, border:'none', borderRadius:T.r10, padding:'6px 10px', cursor:'pointer', fontSize:12 }}>✓</button>
                      <button onClick={()=>updateStatus(a.id,'cancelled')} style={{ background:T.redL, color:T.red, border:'none', borderRadius:T.r10, padding:'6px 10px', cursor:'pointer', fontSize:12 }}>✗</button>
                    </div>
                  )}
                </div>
              ))}
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
  const [avail, setAvail] = useState<{day:number,start:string,end:string}[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!profile) return
    supabase.from('availability').select('*').eq('professional_id',profile.id).eq('active',true)
      .then(({data}) => { if(data) setAvail(data.map(d=>({day:d.day_of_week,start:d.start_time,end:d.end_time}))) })
  }, [profile])

  function toggle(d:number) { setAvail(p=>p.some(a=>a.day===d)?p.filter(a=>a.day!==d):[...p,{day:d,start:'08:00',end:'18:00'}].sort((a,b)=>a.day-b.day)) }
  function upd(d:number,k:string,v:string) { setAvail(p=>p.map(a=>a.day===d?{...a,[k]:v}:a)) }

  async function save() {
    if (!profile) return; setSaving(true)
    await supabase.from('availability').delete().eq('professional_id',profile.id)
    if (avail.length) await supabase.from('availability').insert(avail.map(a=>({professional_id:profile.id,day_of_week:a.day,start_time:a.start,end_time:a.end,slot_minutes:60})))
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2500)
  }

  return (
    <div className="anim-fade">
      <h1 style={{ fontFamily:T.fontSerif, fontSize:28, color:T.dark, marginBottom:6 }}>Horários de atendimento</h1>
      <p style={{ fontSize:14, color:T.muted, marginBottom:24 }}>Configure os dias e horários disponíveis para agendamento.</p>
      <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:24 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          {DAYS_FULL.map((day,i) => {
            const a = avail.find(x=>x.day===i)
            return (
              <div key={day} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:T.r14, border:`2px solid ${a?T.sageP:T.nude}`, background:a?T.sageG:T.off, transition:'all 0.15s' }}>
                <button type="button" onClick={()=>toggle(i)} style={{ width:22, height:22, borderRadius:T.r4, border:`2px solid ${a?T.sage:T.nude}`, background:a?T.sage:T.white, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'all 0.15s' }}>
                  {a && <span style={{ color:T.cream, fontSize:12, fontWeight:700 }}>✓</span>}
                </button>
                <span style={{ fontSize:14, fontWeight:600, color:a?T.dark:T.muted, width:80, flexShrink:0 }}>{day}</span>
                {a ? (
                  <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
                    <input type="time" value={a.start} onChange={e=>upd(i,'start',e.target.value)} style={{ border:`1px solid ${T.sageP}`, background:T.white, borderRadius:T.r10, padding:'7px 12px', fontSize:13, outline:'none', color:T.dark, fontFamily:T.fontSans }}/>
                    <span style={{ fontSize:13, color:T.muted }}>até</span>
                    <input type="time" value={a.end} onChange={e=>upd(i,'end',e.target.value)} style={{ border:`1px solid ${T.sageP}`, background:T.white, borderRadius:T.r10, padding:'7px 12px', fontSize:13, outline:'none', color:T.dark, fontFamily:T.fontSans }}/>
                  </div>
                ) : <span style={{ fontSize:13, color:T.muted, fontStyle:'italic' }}>Clique para ativar</span>}
              </div>
            )
          })}
        </div>
        <button onClick={save} disabled={saving} style={{ width:'100%', padding:'14px', fontSize:15, fontWeight:700, color:T.cream, background:saved?T.sage:T.dark, border:'none', borderRadius:T.r14, cursor:'pointer', fontFamily:T.fontSans, transition:'background 0.2s' }}>
          {saved ? '✓ Horários salvos!' : saving ? 'Salvando...' : 'Salvar horários'}
        </button>
      </div>
    </div>
  )
}

function ProfileTab({ profile, onSave }: { profile: Profile|null, onSave:()=>void }) {
  const [form, setForm] = useState({ name:'', bio:'', whatsapp:'', city:'', state:'', specialties:'', crm:'', instagram:'' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photo, setPhoto] = useState('')
  const fileRef = { current: null as HTMLInputElement|null }

  useEffect(() => {
    if (!profile) return
    setForm({ name:profile.name||'', bio:profile.bio||'', whatsapp:profile.whatsapp||'', city:profile.city||'', state:profile.state||'', specialties:(profile.specialties||[]).join(', '), crm:profile.crm_cro_crp||'', instagram:profile.instagram||'' })
    setPhoto(profile.photo_url||'')
  }, [profile])

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload', { method:'POST', body:fd })
    const { url } = await res.json()
    if (url) setPhoto(url)
    setUploading(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!profile) return; setSaving(true)
    await supabase.from('profiles').update({ name:form.name, bio:form.bio, whatsapp:form.whatsapp, city:form.city, state:form.state, crm_cro_crp:form.crm, instagram:form.instagram, specialties:form.specialties.split(',').map(s=>s.trim()).filter(Boolean) }).eq('id',profile.id)
    setSaving(false); setSaved(true); onSave(); setTimeout(()=>setSaved(false),2500)
  }

  function upd(k:string,v:string) { setForm(f=>({...f,[k]:v})) }

  return (
    <div className="anim-fade">
      <h1 style={{ fontFamily:T.fontSerif, fontSize:28, color:T.dark, marginBottom:6 }}>Meu perfil</h1>
      <p style={{ fontSize:14, color:T.muted, marginBottom:24 }}>Essas informações aparecem na sua página pública.</p>

      {/* Photo */}
      <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:24, marginBottom:20 }}>
        <p style={{ fontWeight:700, fontSize:14, color:T.dark, marginBottom:16 }}>Foto de perfil</p>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:T.sageG, border:`3px solid ${T.sageP}`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, flexShrink:0 }}>
            {photo ? <img src={photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '👤'}
          </div>
          <div>
            <p style={{ fontSize:13, color:T.muted, marginBottom:10 }}>JPG, PNG ou WebP · máx 5MB</p>
            <input type="file" accept="image/*" style={{ display:'none' }} onChange={upload} ref={el => { fileRef.current = el }}/>
            <button type="button" onClick={()=>fileRef.current?.click()} disabled={uploading}
              style={{ display:'flex', alignItems:'center', gap:8, background:T.sageG, border:`1px solid ${T.sageP}`, color:T.sage, borderRadius:T.r12, padding:'9px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:T.fontSans }}>
              <Upload size={14}/> {uploading ? 'Enviando...' : 'Trocar foto'}
            </button>
          </div>
        </div>
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
          <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>Especialidades <span style={{ color:T.muted, fontWeight:400 }}>(separadas por vírgula)</span></label>
          <InputF value={form.specialties} onChange={v=>upd('specialties',v)} placeholder="Ansiedade, Depressão, TCC"/>
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
            <p style={{ fontSize:12, color:T.mid, margin:0 }}>organiza-plus-five.vercel.app/p/{profile.slug}</p>
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
