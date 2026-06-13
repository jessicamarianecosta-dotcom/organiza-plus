'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TrendingUp, Users, Calendar, Eye, MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format, subDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type DayStat = { date: string; bookings: number; views: number }
type TopTime  = { appt_time: string; count: number }

export default function Analytics() {
  const router = useRouter()
  const [loading, setLoading]   = useState(true)
  const [stats, setStats]       = useState({ total: 0, month: 0, pending: 0, completed: 0, clients: 0, views: 0, whatsapp: 0 })
  const [daily, setDaily]       = useState<DayStat[]>([])
  const [topTimes, setTopTimes] = useState<TopTime[]>([])
  const [profId, setProfId]     = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setProfId(user.id)

    const now    = new Date()
    const m0     = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const day30  = subDays(now, 30).toISOString().split('T')[0]

    const [{ data: appts }, { data: events }] = await Promise.all([
      supabase.from('appointments').select('id,status,appt_date,appt_time,client_phone').eq('professional_id', user.id),
      supabase.from('analytics_events').select('event_type,created_at').eq('professional_id', user.id),
    ])

    const a = appts || []
    const e = events || []

    const monthAppts = a.filter(x => x.appt_date >= m0)
    const clients    = new Set(a.map(x => x.client_phone)).size

    // daily stats last 30 days
    const dayMap: Record<string, DayStat> = {}
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(now, i), 'yyyy-MM-dd')
      dayMap[d] = { date: d, bookings: 0, views: 0 }
    }
    a.filter(x => x.appt_date >= day30).forEach(x => { if (dayMap[x.appt_date]) dayMap[x.appt_date].bookings++ })
    e.filter(x => x.event_type === 'page_view' && x.created_at >= day30+'T00:00:00').forEach(x => {
      const d = x.created_at.split('T')[0]
      if (dayMap[d]) dayMap[d].views++
    })

    // top booking times
    const timeCount: Record<string, number> = {}
    a.forEach(x => { const t = x.appt_time?.slice(0,5); if(t) timeCount[t] = (timeCount[t]||0)+1 })
    const top = Object.entries(timeCount).sort((a,b) => b[1]-a[1]).slice(0,5).map(([t,c]) => ({ appt_time:t, count:c }))

    setStats({
      total: a.length, month: monthAppts.length,
      pending: a.filter(x=>x.status==='pending').length,
      completed: a.filter(x=>x.status==='completed').length,
      clients, views: e.filter(x=>x.event_type==='page_view').length,
      whatsapp: e.filter(x=>x.event_type==='whatsapp_click').length,
    })
    setDaily(Object.values(dayMap))
    setTopTimes(top)
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="min-h-screen bg-offwhite flex items-center justify-center"><div className="font-display text-2xl text-sage animate-pulse">Carregando...</div></div>

  const maxBookings = Math.max(...daily.map(d => d.bookings), 1)
  const maxViews    = Math.max(...daily.map(d => d.views), 1)

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-dark transition-colors">
            <ArrowLeft size={16}/> Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-brand-dark">Analytics</h1>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon:<Calendar size={18}/>, label:'Total agendamentos', val: stats.total, color:'text-sage' },
            { icon:<Users size={18}/>, label:'Clientes únicos', val: stats.clients, color:'text-sage' },
            { icon:<Eye size={18}/>, label:'Visualizações página', val: stats.views, color:'text-bege' },
            { icon:<MessageCircle size={18}/>, label:'Cliques WhatsApp', val: stats.whatsapp, color:'text-green-500' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-5 border border-nude/40 shadow-soft">
              <div className={`${c.color} mb-2`}>{c.icon}</div>
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1">{c.label}</p>
              <p className="text-3xl font-bold text-brand-dark">{c.val}</p>
            </div>
          ))}
        </div>

        {/* STATUS */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { label:'Este mês', val: stats.month, bg:'bg-sage-glow', color:'text-sage' },
            { label:'Pendentes', val: stats.pending, bg:'bg-amber-50', color:'text-amber-600' },
            { label:'Concluídos', val: stats.completed, bg:'bg-blue-50', color:'text-blue-500' },
          ].map(c => (
            <div key={c.label} className={`${c.bg} rounded-2xl p-5 border border-nude/20`}>
              <p className="text-sm font-semibold text-brand-muted mb-1">{c.label}</p>
              <p className={`text-4xl font-bold ${c.color}`}>{c.val}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* AGENDAMENTOS 30 DIAS */}
          <div className="bg-white rounded-2xl border border-nude/40 shadow-soft p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-brand-dark text-sm">Agendamentos — últimos 30 dias</h2>
              <span className="bg-sage-glow text-sage text-xs font-bold px-3 py-1 rounded-full">{stats.month} este mês</span>
            </div>
            <div className="flex items-end gap-1 h-28">
              {daily.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-dark text-cream text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {format(new Date(d.date+'T12:00'), 'dd/MM')}: {d.bookings}
                  </div>
                  <div className="w-full rounded-t-sm bg-sage transition-all duration-300 hover:bg-sage-light"
                    style={{ height: `${(d.bookings / maxBookings) * 100}%`, minHeight: d.bookings > 0 ? '3px' : '0' }}/>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-brand-muted">
              <span>{format(subDays(new Date(), 29), 'dd/MM', {locale: ptBR})}</span>
              <span>hoje</span>
            </div>
          </div>

          {/* HORÁRIOS MAIS PEDIDOS */}
          <div className="bg-white rounded-2xl border border-nude/40 shadow-soft p-6">
            <h2 className="font-bold text-brand-dark text-sm mb-5">Horários mais solicitados</h2>
            {topTimes.length === 0 ? (
              <div className="text-center text-brand-muted text-sm py-8">Sem dados ainda.</div>
            ) : (
              <div className="space-y-3">
                {topTimes.map((t, i) => (
                  <div key={t.appt_time} className="flex items-center gap-3">
                    <div className="w-6 text-xs font-bold text-brand-muted text-right">#{i+1}</div>
                    <div className="bg-sage-glow text-sage text-sm font-bold px-3 py-1.5 rounded-lg min-w-[56px] text-center">{t.appt_time}</div>
                    <div className="flex-1 bg-nude rounded-full h-2 overflow-hidden">
                      <div className="bg-sage h-full rounded-full" style={{ width: `${(t.count / topTimes[0].count) * 100}%` }}/>
                    </div>
                    <span className="text-sm font-bold text-brand-dark w-6 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
