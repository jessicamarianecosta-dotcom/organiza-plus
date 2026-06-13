'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { T, GlobalStyles } from '@/lib/ds'
import { ArrowLeft, TrendingUp, Users, Calendar, Eye, MessageCircle, BarChart2, Clock } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type DayStat = { date: string; bookings: number }
type TopTime  = { appt_time: string; count: number }

export default function Analytics() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total:0, month:0, pending:0, completed:0, clients:0, views:0, whatsapp:0 })
  const [daily, setDaily] = useState<DayStat[]>([])
  const [topTimes, setTopTimes] = useState<TopTime[]>([])
  const [profileName, setProfileName] = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const now = new Date()
    const m0   = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const d30  = subDays(now, 30).toISOString().split('T')[0]

    const [{ data: appts }, { data: events }, { data: profile }] = await Promise.all([
      supabase.from('appointments').select('id,status,appt_date,appt_time,client_phone').eq('professional_id', user.id),
      supabase.from('analytics_events').select('event_type,created_at').eq('professional_id', user.id),
      supabase.from('profiles').select('name').eq('id', user.id).single(),
    ])

    const a = appts || [], e = events || []
    setProfileName(profile?.name || '')

    // Daily last 30 days
    const dayMap: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      dayMap[format(subDays(now, i), 'yyyy-MM-dd')] = 0
    }
    a.filter(x => x.appt_date >= d30).forEach(x => { if (dayMap[x.appt_date] !== undefined) dayMap[x.appt_date]++ })
    setDaily(Object.entries(dayMap).map(([date, bookings]) => ({ date, bookings })))

    // Top times
    const timeCount: Record<string, number> = {}
    a.forEach(x => { const t = x.appt_time?.slice(0,5); if(t) timeCount[t] = (timeCount[t]||0)+1 })
    setTopTimes(Object.entries(timeCount).sort((a,b) => b[1]-a[1]).slice(0,5).map(([t,c]) => ({ appt_time:t, count:c })))

    setStats({
      total: a.length, month: a.filter(x=>x.appt_date>=m0).length,
      pending: a.filter(x=>x.status==='pending').length,
      completed: a.filter(x=>x.status==='completed').length,
      clients: new Set(a.map(x=>x.client_phone)).size,
      views: e.filter(x=>x.event_type==='page_view').length,
      whatsapp: e.filter(x=>x.event_type==='whatsapp_click').length,
    })
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div style={{ minHeight:'100vh', background:T.off, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.fontSans }}>
      <GlobalStyles/>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:T.fontSerif, fontSize:24, color:T.dark, marginBottom:12 }}>Organiza<span style={{ color:T.sage }}>+</span></div>
        <div style={{ width:28, height:28, border:`3px solid ${T.sageP}`, borderTopColor:T.sage, borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
      </div>
    </div>
  )

  const maxBookings = Math.max(...daily.map(d => d.bookings), 1)

  return (
    <div style={{ minHeight:'100vh', background:T.off, fontFamily:T.fontSans }}>
      <GlobalStyles/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background:T.white, borderBottom:`1px solid ${T.nude}`, padding:'0 24px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ maxWidth:1080, margin:'0 auto', height:60, display:'flex', alignItems:'center', gap:16 }}>
          <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:T.muted, textDecoration:'none', fontWeight:500 }}
            onMouseEnter={e=>e.currentTarget.style.color=T.dark} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
            <ArrowLeft size={15}/> Dashboard
          </Link>
          <span style={{ color:T.nude, userSelect:'none' }}>|</span>
          <span style={{ fontFamily:T.fontSerif, fontSize:18, color:T.dark }}>Organiza<span style={{ color:T.sage }}>+</span></span>
          <span style={{ marginLeft:'auto', fontSize:13, color:T.muted }}>Analytics · {profileName}</span>
        </div>
      </div>

      <div style={{ maxWidth:1080, margin:'0 auto', padding:'32px 24px 64px' }}>
        {/* Title */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontFamily:T.fontSerif, fontSize:32, color:T.dark, margin:'0 0 4px' }}>Analytics</h1>
          <p style={{ fontSize:14, color:T.muted }}>Métricas dos últimos 30 dias</p>
        </div>

        {/* Top stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:24 }}>
          {[
            { icon:<Calendar size={18}/>,        label:'Total',         value:stats.total,     sub:'agendamentos',     color:T.sage },
            { icon:<Users size={18}/>,           label:'Clientes',      value:stats.clients,   sub:'únicos',           color:T.blue },
            { icon:<TrendingUp size={18}/>,      label:'Este mês',      value:stats.month,     sub:'agendamentos',     color:T.sage },
            { icon:<Eye size={18}/>,             label:'Visualizações', value:stats.views,     sub:'da página',        color:T.muted },
            { icon:<MessageCircle size={18}/>,   label:'WhatsApp',      value:stats.whatsapp,  sub:'cliques',          color:'#25D366' },
            { icon:<BarChart2 size={18}/>,       label:'Concluídos',    value:stats.completed, sub:'consultas',        color:T.blue },
          ].map(c => (
            <div key={c.label} style={{ background:T.white, borderRadius:T.r20, padding:'20px', boxShadow:T.shadowCard }}>
              <div style={{ color:c.color, marginBottom:10 }}>{c.icon}</div>
              <p style={{ fontSize:9, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>{c.label}</p>
              <p style={{ fontSize:30, fontWeight:800, color:T.dark, margin:'5px 0 2px', lineHeight:1 }}>{c.value}</p>
              <p style={{ fontSize:11, color:c.color, fontWeight:500, margin:0 }}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Status row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'Pendentes',  value:stats.pending,   bg:T.amberL,  color:T.amber },
            { label:'Este mês',   value:stats.month,     bg:T.sageG,   color:T.sage },
            { label:'Concluídos', value:stats.completed, bg:T.blueL,   color:T.blue },
          ].map(c => (
            <div key={c.label} style={{ background:c.bg, borderRadius:T.r20, padding:'20px 24px', border:`1px solid rgba(0,0,0,0.05)` }}>
              <p style={{ fontSize:12, fontWeight:600, color:c.color, margin:'0 0 6px', opacity:0.8 }}>{c.label}</p>
              <p style={{ fontFamily:T.fontSerif, fontSize:44, color:c.color, margin:0, lineHeight:1 }}>{c.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Bookings chart */}
          <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:'22px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontFamily:T.fontSerif, fontSize:18, color:T.dark, margin:0 }}>Agendamentos — 30 dias</h2>
              <span style={{ background:T.sageG, color:T.sage, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:T.r100, border:`1px solid ${T.sageP}` }}>
                {stats.month} este mês
              </span>
            </div>
            {/* Bar chart */}
            <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:120, paddingBottom:4 }}>
              {daily.map((d, i) => {
                const pct = (d.bookings / maxBookings) * 100
                const isToday = d.date === format(new Date(), 'yyyy-MM-dd')
                return (
                  <div key={d.date} title={`${format(new Date(d.date+'T12:00'), 'dd/MM')}: ${d.bookings}`}
                    style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'default' }}>
                    <div style={{ width:'100%', borderRadius:'3px 3px 0 0', background:isToday?T.sage:T.sageP, height:`${Math.max(pct, d.bookings>0?3:0)}%`, minHeight:d.bookings>0?4:0, transition:'height 0.3s' }}/>
                  </div>
                )
              })}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
              <span style={{ fontSize:10, color:T.muted }}>{format(subDays(new Date(),29),'dd/MM',{locale:ptBR})}</span>
              <span style={{ fontSize:10, color:T.sage, fontWeight:600 }}>hoje</span>
            </div>
          </div>

          {/* Top times */}
          <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:'22px' }}>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:18, color:T.dark, margin:'0 0 20px' }}>Horários mais pedidos</h2>
            {topTimes.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:T.muted }}>
                <Clock size={32} style={{ margin:'0 auto 10px', opacity:0.3, display:'block' }}/>
                <p style={{ fontSize:13 }}>Sem dados ainda</p>
              </div>
            ) : topTimes.map((t, i) => (
              <div key={t.appt_time} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <span style={{ fontSize:12, fontWeight:700, color:T.muted, width:24, textAlign:'right' }}>#{i+1}</span>
                <div style={{ background:T.sageG, color:T.sage, fontSize:13, fontWeight:700, padding:'6px 12px', borderRadius:T.r10, minWidth:56, textAlign:'center', flexShrink:0 }}>{t.appt_time}</div>
                <div style={{ flex:1, height:8, background:T.nude, borderRadius:T.r4, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:T.sage, borderRadius:T.r4, width:`${(t.count/topTimes[0].count)*100}%`, transition:'width 0.4s ease' }}/>
                </div>
                <span style={{ fontWeight:700, fontSize:14, color:T.dark, minWidth:24, textAlign:'right' }}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
