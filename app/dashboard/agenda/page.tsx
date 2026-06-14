'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { T, GlobalStyles } from '@/lib/ds'
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Bell, FileText, Clock, ArrowLeft, Flag, X, Edit2, Save } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, parseISO, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Task     = { id:string; title:string; done:boolean; priority:'low'|'normal'|'high'; due_date:string|null }
type Note     = { id:string; content:string; color:string; updated_at:string }
type Reminder = { id:string; title:string; remind_at:string; done:boolean }
type Appt     = { id:string; appt_date:string; appt_time:string; client_name:string; status:string }

const PRIORITY_MAP = {
  low:    { label:'Baixa',  color:'#8A9690', bg:'#F7F5F0' },
  normal: { label:'Normal', color:T.sage,    bg:T.sageG   },
  high:   { label:'Alta',   color:'#e05252', bg:'#fef2f2' },
}
const NOTE_COLORS: Record<string,{bg:string,border:string,text:string}> = {
  sage:   { bg:'#EAF3EC', border:'#D6E8DA', text:'#2C3530' },
  bege:   { bg:'#F4EFE8', border:'#E8DDD0', text:'#2C3530' },
  blue:   { bg:'#EFF6FF', border:'#BFDBFE', text:'#1e40af' },
  amber:  { bg:'#FFFBEB', border:'#FCD34D', text:'#92400e' },
  purple: { bg:'#F5F3FF', border:'#DDD6FE', text:'#4c1d95' },
}

function FI({ value, set, placeholder, type='text', style={} }: any) {
  const [f,setF]=useState(false)
  return <input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder}
    style={{ padding:'9px 12px', fontSize:13, color:T.dark, background:T.off, border:`1.5px solid ${f?T.sage:T.nude}`, borderRadius:T.r10, outline:'none', fontFamily:T.fontSans, transition:'border-color 0.15s', ...style }}
    onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
}

export default function AgendaPage() {
  const router = useRouter()
  const [uid, setUid]         = useState('')
  const [profId, setProfId]   = useState('')
  const [loading, setLoading] = useState(true)
  const [currentMonth, setMon] = useState(new Date())
  const [appts, setAppts]     = useState<Appt[]>([])
  const [tasks, setTasks]     = useState<Task[]>([])
  const [notes, setNotes]     = useState<Note[]>([])
  const [reminders, setRem]   = useState<Reminder[]>([])
  const [selDay, setSelDay]   = useState<Date|null>(new Date())
  const [tab, setTab]         = useState<'tarefas'|'notas'|'lembretes'>('tarefas')
  const [newTask, setNewTask] = useState('')
  const [taskPrio, setTaskPrio] = useState<'low'|'normal'|'high'>('normal')
  const [taskDue, setTaskDue]   = useState('')
  const [editId, setEditId]     = useState<string|null>(null)
  const [editText, setEditText] = useState('')
  const [noteColor, setNoteColor] = useState('sage')
  const [noteText, setNoteText]   = useState('')
  const [editNoteId, setEditNoteId] = useState<string|null>(null)
  const [remTitle, setRemTitle] = useState('')
  const [remDate, setRemDate]   = useState('')
  const [remTime, setRemTime]   = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUid(user.id)
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
    if (!profile) { router.push('/onboarding'); return }
    setProfId(profile.id)
    const now = new Date()
    const m0 = format(startOfMonth(now),'yyyy-MM-dd')
    const m1 = format(endOfMonth(addMonths(now,2)),'yyyy-MM-dd')
    const [{ data:a },{ data:tk },{ data:no },{ data:rm }] = await Promise.all([
      supabase.from('appointments').select('id,appt_date,appt_time,client_name,status').eq('professional_id',user.id).gte('appt_date',m0).lte('appt_date',m1).order('appt_date').order('appt_time'),
      supabase.from('tasks').select('*').eq('user_id',user.id).order('created_at',{ascending:false}),
      supabase.from('notes').select('*').eq('user_id',user.id).order('updated_at',{ascending:false}),
      supabase.from('reminders').select('*').eq('user_id',user.id).order('remind_at'),
    ])
    setAppts(a||[]); setTasks(tk||[]); setNotes(no||[]); setRem(rm||[])
    setLoading(false)
  }, [router])

  useEffect(()=>{ load() },[load])

  async function addTask() {
    if (!newTask.trim()) return
    const { data } = await supabase.from('tasks').insert({ user_id:uid, title:newTask.trim(), priority:taskPrio, due_date:taskDue||null }).select().single()
    if (data) setTasks(p=>[data as Task,...p])
    setNewTask(''); setTaskDue('')
  }
  async function toggleTask(id:string,done:boolean) {
    await supabase.from('tasks').update({done}).eq('id',id)
    setTasks(p=>p.map(t=>t.id===id?{...t,done}:t))
  }
  async function deleteTask(id:string) { await supabase.from('tasks').delete().eq('id',id); setTasks(p=>p.filter(t=>t.id!==id)) }
  async function saveEditTask(id:string) {
    if (!editText.trim()) return
    await supabase.from('tasks').update({title:editText}).eq('id',id)
    setTasks(p=>p.map(t=>t.id===id?{...t,title:editText}:t)); setEditId(null)
  }

  async function saveNote() {
    if (!noteText.trim()) return
    if (editNoteId) {
      const { data } = await supabase.from('notes').update({ content:noteText, color:noteColor, updated_at:new Date().toISOString() }).eq('id',editNoteId).select().single()
      if (data) setNotes(p=>p.map(n=>n.id===editNoteId?data as Note:n)); setEditNoteId(null)
    } else {
      const { data } = await supabase.from('notes').insert({ user_id:uid, content:noteText, color:noteColor }).select().single()
      if (data) setNotes(p=>[data as Note,...p])
    }
    setNoteText(''); setNoteColor('sage')
  }
  async function deleteNote(id:string) { await supabase.from('notes').delete().eq('id',id); setNotes(p=>p.filter(n=>n.id!==id)) }
  function startEditNote(n:Note) { setEditNoteId(n.id); setNoteText(n.content); setNoteColor(n.color) }

  async function addReminder() {
    if (!remTitle.trim()||!remDate||!remTime) return
    const remind_at = new Date(`${remDate}T${remTime}`).toISOString()
    const { data } = await supabase.from('reminders').insert({ user_id:uid, title:remTitle.trim(), remind_at }).select().single()
    if (data) setRem(p=>[...p,data as Reminder].sort((a,b)=>a.remind_at.localeCompare(b.remind_at)))
    setRemTitle(''); setRemDate(''); setRemTime('')
  }
  async function toggleReminder(id:string,done:boolean) { await supabase.from('reminders').update({done}).eq('id',id); setRem(p=>p.map(r=>r.id===id?{...r,done}:r)) }
  async function deleteReminder(id:string) { await supabase.from('reminders').delete().eq('id',id); setRem(p=>p.filter(r=>r.id!==id)) }

  function getDayAppts(d:Date) { const ds=format(d,'yyyy-MM-dd'); return appts.filter(a=>a.appt_date===ds) }

  function buildCalDays() {
    const start = startOfWeek(startOfMonth(currentMonth),{weekStartsOn:0})
    const end   = endOfWeek(endOfMonth(currentMonth),{weekStartsOn:0})
    const days:Date[]=[]
    let cur=start; while(cur<=end){days.push(cur);cur=addDays(cur,1)}
    return days
  }
  const calDays = buildCalDays()
  const selDayAppts = selDay ? getDayAppts(selDay) : []
  const pendingTasks = tasks.filter(t=>!t.done)
  const doneTasks    = tasks.filter(t=>t.done)
  const urgentRem    = reminders.filter(r=>!r.done && isBefore(parseISO(r.remind_at), addDays(new Date(),2)))

  if (loading) return (
    <div style={{ minHeight:'100vh', background:T.off, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.fontSans }}>
      <GlobalStyles/><div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:T.fontSerif, fontSize:24, color:T.dark, marginBottom:12 }}>Organiza<span style={{color:T.sage}}>+</span></div>
        <div style={{ width:28,height:28,border:`3px solid ${T.sageP}`,borderTopColor:T.sage,borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto' }}/>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:T.off, fontFamily:T.fontSans, color:T.dark }}>
      <GlobalStyles/>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeIn 0.3s ease both}
        .task-row:hover .task-actions{opacity:1!important}
        input[type='date']::-webkit-calendar-picker-indicator,
        input[type='time']::-webkit-calendar-picker-indicator{opacity:0.4;cursor:pointer}
        @media(max-width:900px){.agenda-layout{grid-template-columns:1fr!important}}
      `}</style>

      {/* Header */}
      <div style={{ background:T.white, borderBottom:`1px solid ${T.nude}`, padding:'0 24px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', height:60, display:'flex', alignItems:'center', gap:14 }}>
          <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, color:T.muted, textDecoration:'none', fontWeight:500 }}
            onMouseEnter={e=>e.currentTarget.style.color=T.dark} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
            <ArrowLeft size={15}/> Dashboard
          </Link>
          <span style={{ color:T.nude }}>|</span>
          <span style={{ fontFamily:T.fontSerif, fontSize:18, color:T.dark }}>Organiza<span style={{color:T.sage}}>+</span></span>
          <span style={{ fontSize:14, fontWeight:600, color:T.dark }}>· Agenda & Workspace</span>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            {urgentRem.length>0 && <span style={{ background:'#fef2f2', color:'#e05252', border:'1px solid #fecaca', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:T.r100, display:'flex', alignItems:'center', gap:4 }}><Bell size={11}/>{urgentRem.length} urgente{urgentRem.length>1?'s':''}</span>}
            {pendingTasks.length>0 && <span style={{ background:T.sageG, color:T.sage, border:`1px solid ${T.sageP}`, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:T.r100 }}>✓ {pendingTasks.length} pendente{pendingTasks.length>1?'s':''}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'24px 20px 60px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:20, alignItems:'start' }} className="agenda-layout">

          {/* ── CALENDAR ── */}
          <div>
            <div style={{ background:T.white, borderRadius:T.r24, boxShadow:T.shadowCard, overflow:'hidden', marginBottom:16 }}>
              {/* Cal header */}
              <div style={{ padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${T.nude}`, gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, margin:0, textTransform:'capitalize' }}>
                    {format(currentMonth,'MMMM yyyy',{locale:ptBR})}
                  </h2>
                  <button onClick={()=>setMon(new Date())} style={{ background:T.sageG, color:T.sage, border:`1px solid ${T.sageP}`, borderRadius:T.r100, padding:'3px 10px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:T.fontSans }}>
                    Hoje
                  </button>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {[{icon:<ChevronLeft size={16}/>,fn:()=>setMon(subMonths(currentMonth,1))},{icon:<ChevronRight size={16}/>,fn:()=>setMon(addMonths(currentMonth,1))}].map((b,i)=>(
                    <button key={i} onClick={b.fn} style={{ width:32,height:32,borderRadius:T.r10,border:`1px solid ${T.nude}`,background:T.off,color:T.mid,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s' }}
                      onMouseEnter={e=>{e.currentTarget.style.background=T.sageG;e.currentTarget.style.color=T.sage;e.currentTarget.style.borderColor=T.sageL}}
                      onMouseLeave={e=>{e.currentTarget.style.background=T.off;e.currentTarget.style.color=T.mid;e.currentTarget.style.borderColor=T.nude}}>
                      {b.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day labels */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'12px 14px 0', gap:4 }}>
                {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d=>(
                  <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.05em', paddingBottom:8 }}>{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 14px 14px', gap:4 }}>
                {calDays.map((d,i)=>{
                  const da = getDayAppts(d)
                  const inMonth = isSameMonth(d,currentMonth)
                  const tod  = isToday(d)
                  const sel  = selDay&&isSameDay(d,selDay)
                  return (
                    <button key={i} onClick={()=>setSelDay(d)}
                      style={{ aspectRatio:'1', borderRadius:T.r12, border:'none', background:sel?T.sage:tod?T.sageG:da.length>0?`${T.sageG}70`:'transparent', color:sel?'#fff':tod?T.sage:inMonth?T.dark:`${T.nude}cc`, cursor:'pointer', fontFamily:T.fontSans, fontWeight:tod||sel?700:400, fontSize:13, transition:'all 0.15s', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, outline:sel?`2px solid ${T.sage}`:'none', outlineOffset:1 }}
                      onMouseEnter={e=>{ if(!sel){e.currentTarget.style.background=T.sageG;e.currentTarget.style.color=T.sage} }}
                      onMouseLeave={e=>{ if(!sel){e.currentTarget.style.background=da.length>0?`${T.sageG}70`:tod?T.sageG:'transparent';e.currentTarget.style.color=tod?T.sage:inMonth?T.dark:`${T.nude}cc`} }}>
                      <span>{format(d,'d')}</span>
                      {da.length>0 && (
                        <div style={{ display:'flex', gap:2 }}>
                          {da.slice(0,3).map((_,ii)=><div key={ii} style={{ width:4,height:4,borderRadius:'50%',background:sel?'rgba(255,255,255,0.8)':T.sage }}/>)}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div style={{ padding:'6px 18px 14px', display:'flex', gap:16 }}>
                <span style={{ fontSize:11, color:T.muted, display:'flex', alignItems:'center', gap:5 }}><div style={{ width:8,height:8,borderRadius:'50%',background:T.sage }}/> Com agendamentos</span>
                <span style={{ fontSize:11, color:T.muted, display:'flex', alignItems:'center', gap:5 }}><div style={{ width:8,height:8,borderRadius:'50%',background:T.sageL }}/> Hoje</span>
              </div>
            </div>

            {/* Selected day panel */}
            {selDay && (
              <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden' }} className="fade">
                <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.nude}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <h3 style={{ fontFamily:T.fontSerif, fontSize:17, color:T.dark, margin:0, textTransform:'capitalize' }}>
                      {format(selDay,"EEEE, dd 'de' MMMM",{locale:ptBR})}
                    </h3>
                    {isToday(selDay) && <span style={{ fontSize:11, color:T.sage, fontWeight:700 }}>Hoje</span>}
                  </div>
                  <span style={{ background:T.sageG, color:T.sage, border:`1px solid ${T.sageP}`, fontSize:11, fontWeight:700, padding:'4px 11px', borderRadius:T.r100 }}>
                    {selDayAppts.length} agendamento{selDayAppts.length!==1?'s':''}
                  </span>
                </div>
                {selDayAppts.length===0 ? (
                  <div style={{ padding:'36px 24px', textAlign:'center', color:T.muted }}>
                    <div style={{ fontSize:36, marginBottom:8 }}>🗓️</div>
                    <p style={{ fontWeight:600, color:T.dark, margin:'0 0 4px' }}>Dia livre</p>
                    <p style={{ fontSize:13, margin:0 }}>Nenhum agendamento neste dia.</p>
                  </div>
                ) : selDayAppts.map(a=>{
                  const sc = {pending:'#d97706',confirmed:T.sage,cancelled:'#ef4444',completed:T.blue} as any
                  const sl = {pending:'Pendente',confirmed:'Confirmado',cancelled:'Cancelado',completed:'Concluído'} as any
                  return (
                    <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 20px', borderBottom:`1px solid ${T.nude}` }}>
                      <div style={{ background:T.sageG, color:T.sage, fontWeight:700, fontSize:13, padding:'6px 11px', borderRadius:T.r12, flexShrink:0, minWidth:54, textAlign:'center' }}>
                        {a.appt_time.slice(0,5)}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:600, fontSize:14, color:T.dark, margin:0 }}>{a.client_name}</p>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:T.r100, background:`${(sc[a.status]||T.sage)}18`, color:sc[a.status]||T.sage }}>
                        {sl[a.status]||a.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── WORKSPACE SIDEBAR ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Tab switcher */}
            <div style={{ background:T.white, borderRadius:T.r16, padding:4, display:'flex', gap:2, boxShadow:T.shadowCard }}>
              {([
                { id:'tarefas' as const,   icon:'✓',  label:'Tarefas' },
                { id:'notas' as const,     icon:'📝', label:'Notas' },
                { id:'lembretes' as const, icon:'🔔', label:'Lembretes' },
              ]).map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'9px 6px', borderRadius:T.r12, border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:T.fontSans, transition:'all 0.15s', background:tab===t.id?T.sage:'transparent', color:tab===t.id?T.cream:T.muted }}>
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>

            {/* TAREFAS */}
            {tab==='tarefas' && (
              <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden' }} className="fade">
                <div style={{ padding:'16px 18px', borderBottom:`1px solid ${T.nude}` }}>
                  <h3 style={{ fontFamily:T.fontSerif, fontSize:16, color:T.dark, margin:'0 0 12px', display:'flex', alignItems:'center', gap:7 }}>
                    <Check size={15} style={{color:T.sage}}/> Tarefas
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <FI value={newTask} set={setNewTask} placeholder="Nova tarefa..." style={{ width:'100%' }}/>
                    <div style={{ display:'flex', gap:8 }}>
                      <select value={taskPrio} onChange={e=>setTaskPrio(e.target.value as any)} style={{ flex:1, padding:'8px 10px', fontSize:12, color:T.dark, background:T.off, border:`1.5px solid ${T.nude}`, borderRadius:T.r10, outline:'none', fontFamily:T.fontSans, cursor:'pointer' }}>
                        <option value="low">🔵 Baixa</option>
                        <option value="normal">🟢 Normal</option>
                        <option value="high">🔴 Alta</option>
                      </select>
                      <FI value={taskDue} set={setTaskDue} type="date" style={{ flex:1 }}/>
                    </div>
                    <button onClick={addTask} disabled={!newTask.trim()} style={{ width:'100%', padding:'9px', background:T.sage, color:T.cream, border:'none', borderRadius:T.r10, fontSize:13, fontWeight:700, cursor:newTask.trim()?'pointer':'not-allowed', fontFamily:T.fontSans, display:'flex', alignItems:'center', justifyContent:'center', gap:5, opacity:newTask.trim()?1:0.45, transition:'background 0.15s' }}
                      onMouseEnter={e=>{if(newTask.trim())e.currentTarget.style.background=T.mid}} onMouseLeave={e=>{if(newTask.trim())e.currentTarget.style.background=T.sage}}>
                      <Plus size={14}/> Adicionar
                    </button>
                  </div>
                </div>
                <div style={{ maxHeight:460, overflowY:'auto' }}>
                  {tasks.length===0 && <div style={{ padding:'32px', textAlign:'center', color:T.muted }}><div style={{ fontSize:32, marginBottom:8 }}>✅</div><p style={{ fontSize:13 }}>Nenhuma tarefa.</p></div>}
                  {pendingTasks.map(t=>(
                    <div key={t.id} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'11px 18px', borderBottom:`1px solid ${T.nude}`, transition:'background 0.12s' }} className="task-row"
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background=`${T.sageG}50`}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent'}}>
                      <button onClick={()=>toggleTask(t.id,true)} style={{ width:20,height:20,borderRadius:6,border:`2px solid ${T.nude}`,background:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,marginTop:2,transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=T.sage}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.nude}}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        {editId===t.id ? (
                          <div style={{ display:'flex', gap:5 }}>
                            <input value={editText} onChange={e=>setEditText(e.target.value)} autoFocus style={{ flex:1, padding:'5px 8px', fontSize:13, color:T.dark, background:T.off, border:`1.5px solid ${T.sage}`, borderRadius:T.r8, outline:'none', fontFamily:T.fontSans }}/>
                            <button onClick={()=>saveEditTask(t.id)} style={{ background:T.sage,color:'white',border:'none',borderRadius:T.r8,padding:'5px 8px',cursor:'pointer' }}><Save size={12}/></button>
                            <button onClick={()=>setEditId(null)} style={{ background:T.off,color:T.muted,border:`1px solid ${T.nude}`,borderRadius:T.r8,padding:'5px 8px',cursor:'pointer' }}><X size={12}/></button>
                          </div>
                        ) : (
                          <>
                            <p style={{ fontSize:13,fontWeight:500,color:T.dark,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{t.title}</p>
                            <div style={{ display:'flex',gap:7,marginTop:3,flexWrap:'wrap' }}>
                              <span style={{ fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:T.r100,background:PRIORITY_MAP[t.priority].bg,color:PRIORITY_MAP[t.priority].color }}><Flag size={7} style={{display:'inline',marginRight:2}}/>{PRIORITY_MAP[t.priority].label}</span>
                              {t.due_date && <span style={{ fontSize:9,color:T.muted,fontWeight:500 }}>📅 {format(parseISO(t.due_date+'T12:00'),'dd/MM')}</span>}
                            </div>
                          </>
                        )}
                      </div>
                      {editId!==t.id && (
                        <div style={{ display:'flex',gap:3,opacity:0,transition:'opacity 0.15s' }} className="task-actions">
                          <button onClick={()=>{setEditId(t.id);setEditText(t.title)}} style={{ background:'none',border:'none',cursor:'pointer',color:T.muted,padding:2,display:'flex' }}><Edit2 size={11}/></button>
                          <button onClick={()=>deleteTask(t.id)} style={{ background:'none',border:'none',cursor:'pointer',color:T.muted,padding:2,display:'flex' }} onMouseEnter={e=>e.currentTarget.style.color='#ef4444'} onMouseLeave={e=>e.currentTarget.style.color=T.muted}><Trash2 size={11}/></button>
                        </div>
                      )}
                    </div>
                  ))}
                  {doneTasks.length>0 && (
                    <>
                      <div style={{ padding:'8px 18px 4px', fontSize:10, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em' }}>Concluídas ({doneTasks.length})</div>
                      {doneTasks.map(t=>(
                        <div key={t.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 18px',borderBottom:`1px solid ${T.nude}`,opacity:0.55 }}>
                          <button onClick={()=>toggleTask(t.id,false)} style={{ width:20,height:20,borderRadius:6,border:`2px solid ${T.sage}`,background:T.sage,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,transition:'all 0.15s' }}>
                            <Check size={10} color="white" strokeWidth={3}/>
                          </button>
                          <p style={{ flex:1,fontSize:13,color:T.muted,margin:0,textDecoration:'line-through',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{t.title}</p>
                          <button onClick={()=>deleteTask(t.id)} style={{ background:'none',border:'none',cursor:'pointer',color:T.nude,padding:2,display:'flex' }}><Trash2 size={11}/></button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* NOTAS */}
            {tab==='notas' && (
              <div className="fade">
                <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:'16px 18px', marginBottom:12 }}>
                  <h3 style={{ fontFamily:T.fontSerif, fontSize:16, color:T.dark, margin:'0 0 12px', display:'flex', alignItems:'center', gap:7 }}>
                    📝 {editNoteId?'Editar nota':'Nova nota'}
                  </h3>
                  <textarea rows={4} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Anotação rápida..."
                    style={{ width:'100%', padding:'10px 12px', fontSize:13, color:T.dark, background:T.off, border:`1.5px solid ${T.nude}`, borderRadius:T.r12, outline:'none', resize:'vertical', fontFamily:T.fontSans, marginBottom:10, transition:'border-color 0.15s' }}
                    onFocus={e=>e.target.style.borderColor=T.sage} onBlur={e=>e.target.style.borderColor=T.nude}/>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:11, color:T.muted, fontWeight:600 }}>Cor:</span>
                    {Object.entries(NOTE_COLORS).map(([k,v])=>(
                      <button key={k} type="button" onClick={()=>setNoteColor(k)} style={{ width:22,height:22,borderRadius:'50%',background:v.bg,border:`2px solid ${noteColor===k?T.sage:v.border}`,cursor:'pointer',transition:'transform 0.15s',transform:noteColor===k?'scale(1.2)':'scale(1)' }}/>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    {editNoteId && <button onClick={()=>{setEditNoteId(null);setNoteText('');setNoteColor('sage')}} style={{ padding:'8px 12px', background:'transparent', border:`1.5px solid ${T.nude}`, borderRadius:T.r10, fontSize:12, fontWeight:600, cursor:'pointer', color:T.muted, fontFamily:T.fontSans }}>Cancelar</button>}
                    <button onClick={saveNote} disabled={!noteText.trim()} style={{ flex:1, padding:'9px', background:T.sage, color:T.cream, border:'none', borderRadius:T.r10, fontSize:13, fontWeight:700, cursor:noteText.trim()?'pointer':'not-allowed', fontFamily:T.fontSans, opacity:noteText.trim()?1:0.45, transition:'background 0.15s' }}
                      onMouseEnter={e=>{if(noteText.trim())e.currentTarget.style.background=T.mid}} onMouseLeave={e=>{if(noteText.trim())e.currentTarget.style.background=T.sage}}>
                      {editNoteId ? '💾 Salvar' : '+ Adicionar'}
                    </button>
                  </div>
                </div>
                {notes.length===0 ? (
                  <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:'36px', textAlign:'center' }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>📝</div>
                    <p style={{ fontSize:13, color:T.muted }}>Nenhuma nota ainda.</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {notes.map(n=>{
                      const c = NOTE_COLORS[n.color]||NOTE_COLORS.sage
                      return (
                        <div key={n.id} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:T.r16, padding:'14px 16px', boxShadow:T.shadowSm }}>
                          <p style={{ fontSize:13, color:c.text, lineHeight:1.65, margin:'0 0 8px', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{n.content}</p>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:10, color:`${c.text}55`, fontWeight:500 }}>{format(parseISO(n.updated_at),'dd/MM HH:mm')}</span>
                            <div style={{ display:'flex', gap:5 }}>
                              <button onClick={()=>startEditNote(n)} style={{ background:'none',border:'none',cursor:'pointer',color:`${c.text}55`,padding:2,display:'flex' }}><Edit2 size={12}/></button>
                              <button onClick={()=>deleteNote(n.id)} style={{ background:'none',border:'none',cursor:'pointer',color:`${c.text}55`,padding:2,display:'flex' }}><Trash2 size={12}/></button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LEMBRETES */}
            {tab==='lembretes' && (
              <div className="fade">
                <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, padding:'16px 18px', marginBottom:12 }}>
                  <h3 style={{ fontFamily:T.fontSerif, fontSize:16, color:T.dark, margin:'0 0 12px', display:'flex', alignItems:'center', gap:7 }}>
                    <Bell size={15} style={{color:T.sage}}/> Novo lembrete
                  </h3>
                  <FI value={remTitle} set={setRemTitle} placeholder="Ex: Ligar para paciente Maria" style={{ width:'100%', marginBottom:8 }}/>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                    <FI value={remDate} set={setRemDate} type="date" style={{ width:'100%' }}/>
                    <FI value={remTime} set={setRemTime} type="time" style={{ width:'100%' }}/>
                  </div>
                  <button onClick={addReminder} disabled={!remTitle.trim()||!remDate||!remTime} style={{ width:'100%', padding:'9px', background:T.sage, color:T.cream, border:'none', borderRadius:T.r10, fontSize:13, fontWeight:700, cursor:(remTitle.trim()&&remDate&&remTime)?'pointer':'not-allowed', fontFamily:T.fontSans, display:'flex', alignItems:'center', justifyContent:'center', gap:5, opacity:(remTitle.trim()&&remDate&&remTime)?1:0.45, transition:'background 0.15s' }}
                    onMouseEnter={e=>{if(remTitle.trim()&&remDate&&remTime)e.currentTarget.style.background=T.mid}} onMouseLeave={e=>{if(remTitle.trim()&&remDate&&remTime)e.currentTarget.style.background=T.sage}}>
                    <Plus size={14}/> Adicionar lembrete
                  </button>
                </div>
                <div style={{ background:T.white, borderRadius:T.r20, boxShadow:T.shadowCard, overflow:'hidden' }}>
                  {reminders.length===0 ? (
                    <div style={{ padding:'36px', textAlign:'center' }}><div style={{ fontSize:32, marginBottom:8 }}>🔔</div><p style={{ fontSize:13, color:T.muted }}>Nenhum lembrete.</p></div>
                  ) : reminders.map(r=>{
                    const dt = parseISO(r.remind_at)
                    const over = isBefore(dt,new Date())&&!r.done
                    const urg  = isBefore(dt,addDays(new Date(),2))&&!r.done
                    return (
                      <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 18px', borderBottom:`1px solid ${T.nude}`, opacity:r.done?0.45:1, background:over?'#fef2f208':'transparent' }}>
                        <button onClick={()=>toggleReminder(r.id,!r.done)} style={{ width:20,height:20,borderRadius:'50%',border:`2px solid ${r.done?T.sage:urg?'#e05252':T.nude}`,background:r.done?T.sage:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,transition:'all 0.15s' }}>
                          {r.done&&<Check size={10} color="white" strokeWidth={3}/>}
                        </button>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontWeight:600, fontSize:13, color:T.dark, margin:0, textDecoration:r.done?'line-through':'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</p>
                          <p style={{ fontSize:10, color:over?'#e05252':T.muted, margin:0, display:'flex', alignItems:'center', gap:3 }}>
                            <Clock size={9}/> {format(dt,"dd/MM 'às' HH:mm")}
                            {over&&!r.done&&<span style={{ color:'#e05252', fontWeight:700 }}> · Vencido</span>}
                          </p>
                        </div>
                        <button onClick={()=>deleteReminder(r.id)} style={{ background:'none',border:'none',cursor:'pointer',color:T.nude,padding:2,display:'flex',transition:'color 0.15s' }} onMouseEnter={e=>e.currentTarget.style.color='#ef4444'} onMouseLeave={e=>e.currentTarget.style.color=T.nude}><Trash2 size={12}/></button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
