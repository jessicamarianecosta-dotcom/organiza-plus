'use client'
import { useState, useCallback } from 'react'
import { T } from '@/lib/ds'
import { Zap, Plus, X, ChevronDown, Copy } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────
export type DayConfig = {
  enabled:      boolean
  start:        string
  end:          string
  lunchStart:   string | null
  lunchEnd:     string | null
  apptDuration: number
  breakMins:    number
}

export type WeekConfig = Record<number, DayConfig>  // 0=Sun … 6=Sat

export type BlockedSlot = {
  id?:        string
  date:       string
  allDay:     boolean
  startTime?: string
  endTime?:   string
  reason:     string
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const DAYS_FULL  = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
const DAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

const DURATION_OPTIONS = [15,20,25,30,40,45,50,60,75,90,120]
const BREAK_OPTIONS    = [0,5,10,15,20,30]

function defaultDay(): DayConfig {
  return { enabled:false, start:'08:00', end:'18:00', lunchStart:'12:00', lunchEnd:'13:00', apptDuration:50, breakMins:10 }
}

export function defaultWeek(): WeekConfig {
  const w: WeekConfig = {}
  for (let i=0; i<7; i++) w[i] = defaultDay()
  ;[1,2,3,4,5].forEach(d => { w[d].enabled = true })
  return w
}

function previewSlots(cfg: DayConfig): string[] {
  if (!cfg.enabled) return []
  const slots: string[] = []
  let [h,m] = cfg.start.split(':').map(Number)
  const [eh,em] = cfg.end.split(':').map(Number)
  const step = cfg.apptDuration + cfg.breakMins
  const lunchS = cfg.lunchStart ? cfg.lunchStart.split(':').map(Number) : null
  const lunchE = cfg.lunchEnd   ? cfg.lunchEnd.split(':').map(Number)   : null

  while (true) {
    const endH = h + Math.floor((m + cfg.apptDuration) / 60)
    const endM = (m + cfg.apptDuration) % 60
    if (endH > eh || (endH === eh && endM > em)) break
    const slot = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
    const isLunch = lunchS && lunchE && (
      (h*60+m) < (lunchE[0]*60+lunchE[1]) && (endH*60+endM) > (lunchS[0]*60+lunchS[1])
    )
    if (!isLunch) slots.push(slot)
    m += step; h += Math.floor(m/60); m = m%60
  }
  return slots
}

// ─── Sub-components ────────────────────────────────────────────────────────
function TI({ value, set, label, disabled }: { value:string, set:(v:string)=>void, label?:string, disabled?:boolean }) {
  const [f, setF] = useState(false)
  return (
    <div>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>}
      <input type="time" value={value} onChange={e=>set(e.target.value)} disabled={disabled}
        style={{ padding:'9px 10px', fontSize:14, color:T.dark, background:disabled?T.nude:T.white, border:`1.5px solid ${f?T.sage:T.nude}`, borderRadius:T.r10, outline:'none', fontFamily:T.fontSans, width:'100%', boxSizing:'border-box', cursor:disabled?'not-allowed':'text' }}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
    </div>
  )
}

function Select({ value, set, options, label }: { value:number, set:(v:number)=>void, options:number[], label?:string }) {
  return (
    <div>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:600, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>}
      <select value={value} onChange={e=>set(Number(e.target.value))}
        style={{ padding:'9px 10px', fontSize:13, color:T.dark, background:T.white, border:`1.5px solid ${T.nude}`, borderRadius:T.r10, outline:'none', fontFamily:T.fontSans, width:'100%', boxSizing:'border-box', cursor:'pointer', appearance:'none' }}>
        {options.map(o=><option key={o} value={o}>{o} min</option>)}
      </select>
    </div>
  )
}

// ─── DayCard ──────────────────────────────────────────────────────────────
function DayCard({ dayIdx, cfg, onChange, theme, onCopyToAll }: {
  dayIdx:     number
  cfg:        DayConfig
  onChange:   (c: DayConfig) => void
  theme:      { primary:string; glow:string; pale:string }
  onCopyToAll:(cfg: DayConfig) => void
}) {
  const [expanded,    setExpanded]    = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const up = useCallback(<K extends keyof DayConfig>(k:K, v:DayConfig[K]) => {
    onChange({ ...cfg, [k]: v })
  }, [cfg, onChange])

  const slots = previewSlots(cfg)

  return (
    <div className="sch-card" style={{
      borderRadius: T.r16,
      border:       `2px solid ${cfg.enabled ? theme.pale : T.nude}`,
      background:   cfg.enabled ? theme.glow : T.off,
      transition:   'all 0.2s ease',
      overflow:     'hidden',
    }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 14px', cursor:'pointer' }}
        onClick={() => { if (cfg.enabled) setExpanded(!expanded) }}>

        <button type="button"
          onClick={e => { e.stopPropagation(); up('enabled', !cfg.enabled); if (!cfg.enabled) setExpanded(true) }}
          style={{ width:22, height:22, borderRadius:6, border:`2px solid ${cfg.enabled?theme.primary:T.nude}`, background:cfg.enabled?theme.primary:T.white, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'all 0.15s' }}>
          {cfg.enabled && <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>✓</span>}
        </button>

        <span style={{ fontWeight:700, fontSize:14, color:cfg.enabled?T.dark:T.muted, flex:1 }}>
          {DAYS_FULL[dayIdx]}
        </span>

        {cfg.enabled && (
          <span className="sch-summary" style={{ fontSize:11, color:theme.primary, fontWeight:600, textAlign:'right', lineHeight:1.4 }}>
            {cfg.start}–{cfg.end}
            {cfg.lunchStart && cfg.lunchEnd ? <><br/>🍽 {cfg.lunchStart}–{cfg.lunchEnd}</> : ''}
          </span>
        )}
        {!cfg.enabled && (
          <span style={{ fontSize:12, color:T.muted, fontStyle:'italic' }}>Desativado</span>
        )}
        {cfg.enabled && (
          <div style={{ color:T.muted, display:'flex', alignItems:'center', transition:'transform 0.2s', transform:expanded?'rotate(180deg)':'none', flexShrink:0 }}>
            <ChevronDown size={16}/>
          </div>
        )}
      </div>

      {/* Expanded body */}
      {cfg.enabled && expanded && (
        <div style={{ padding:'0 14px 14px', animation:'fadeIn 0.2s ease' }}>
          <div style={{ height:1, background:theme.pale, marginBottom:14 }}/>

          {/* Work hours */}
          <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 8px' }}>
            Horário de trabalho
          </p>
          <div className="sch-grid-2" style={{ marginBottom:16 }}>
            <TI label="Entrada" value={cfg.start} set={v=>up('start',v)}/>
            <TI label="Saída"   value={cfg.end}   set={v=>up('end',v)}/>
          </div>

          {/* Lunch break — always visible */}
          <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 8px', display:'flex', alignItems:'center', gap:6 }}>
            🍽 Intervalo de almoço
          </p>
          <div className="sch-grid-2" style={{ marginBottom:16, padding:'12px', background:T.white, borderRadius:T.r12, border:`1px solid ${theme.pale}` }}>
            <TI label="Início do almoço"   value={cfg.lunchStart||'12:00'} set={v=>up('lunchStart',v)}/>
            <TI label="Término do almoço"  value={cfg.lunchEnd  ||'13:00'} set={v=>up('lunchEnd',v)}/>
          </div>

          {/* Duration + break */}
          <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 8px' }}>
            Configuração de consultas
          </p>
          <div className="sch-grid-2" style={{ marginBottom:14 }}>
            <Select label="⏱ Duração"         value={cfg.apptDuration} set={v=>up('apptDuration',v)} options={DURATION_OPTIONS}/>
            <Select label="🔄 Intervalo entre" value={cfg.breakMins}    set={v=>up('breakMins',v)}    options={BREAK_OPTIONS}/>
          </div>

          {/* Slot preview */}
          <div style={{ marginBottom:12 }}>
            <button type="button" onClick={()=>setShowPreview(!showPreview)}
              style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:theme.primary, background:'none', border:'none', cursor:'pointer', fontFamily:T.fontSans }}>
              <Zap size={12}/> {showPreview?'Ocultar':'Ver'} horários gerados ({slots.length} slots)
            </button>
            {showPreview && (
              <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:5 }}>
                {slots.map(s=>(
                  <span key={s} style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:T.r100, background:T.white, border:`1px solid ${theme.pale}`, color:theme.primary }}>{s}</span>
                ))}
                {slots.length===0 && <span style={{ fontSize:12, color:T.red }}>⚠ Nenhum horário com essa configuração.</span>}
              </div>
            )}
          </div>

          {/* Copy to all */}
          <button type="button" onClick={()=>onCopyToAll(cfg)}
            style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:T.muted, background:T.off, border:`1px solid ${T.nude}`, borderRadius:T.r10, padding:'7px 12px', cursor:'pointer', fontFamily:T.fontSans, transition:'all 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.color=theme.primary;e.currentTarget.style.borderColor=theme.primary;e.currentTarget.style.background=theme.glow}}
            onMouseLeave={e=>{e.currentTarget.style.color=T.muted;e.currentTarget.style.borderColor=T.nude;e.currentTarget.style.background=T.off}}>
            <Copy size={12}/> Aplicar para todos os dias ativos
          </button>
        </div>
      )}
    </div>
  )
}

// ─── BlockedSlots ──────────────────────────────────────────────────────────
function BlockedSlotsSection({ blocked, onChange, theme }: {
  blocked:  BlockedSlot[]
  onChange: (b: BlockedSlot[]) => void
  theme:    { primary:string; glow:string; pale:string }
}) {
  const [date,   setDate]   = useState('')
  const [reason, setReason] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [start,  setStart]  = useState('09:00')
  const [end,    setEnd]    = useState('10:00')
  const [fi, setFi] = useState(false)
  const [fr, setFr] = useState(false)

  function add() {
    if (!date) return
    onChange([...blocked, { date, allDay, startTime:allDay?undefined:start, endTime:allDay?undefined:end, reason:reason.trim()||'Bloqueado' }])
    setDate(''); setReason('')
  }

  return (
    <div style={{ background:T.white, borderRadius:T.r16, border:`1px solid ${T.nude}`, overflow:'hidden' }}>
      <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.nude}`, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:20 }}>🚫</span>
        <div>
          <p style={{ fontWeight:700, fontSize:14, color:T.dark, margin:0 }}>Bloquear datas</p>
          <p style={{ fontSize:12, color:T.muted, margin:0 }}>Feriados, férias ou pausas específicas</p>
        </div>
      </div>
      <div style={{ padding:'14px' }}>
        <div className="sch-grid-2" style={{ marginBottom:10 }}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            style={{ padding:'9px 10px', fontSize:13, color:T.dark, background:T.off, border:`1.5px solid ${fi?T.sage:T.nude}`, borderRadius:T.r10, outline:'none', fontFamily:T.fontSans, width:'100%', boxSizing:'border-box' }}
            onFocus={()=>setFi(true)} onBlur={()=>setFi(false)}/>
          <button type="button" onClick={()=>setAllDay(!allDay)}
            style={{ padding:'9px 10px', borderRadius:T.r10, border:`1.5px solid ${!allDay?T.sage:T.nude}`, background:!allDay?T.sageG:T.off, color:!allDay?T.sage:T.muted, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:T.fontSans, transition:'all 0.15s', width:'100%', boxSizing:'border-box' }}>
            {allDay ? '🕐 Horário específico' : '📅 Dia inteiro'}
          </button>
        </div>

        {!allDay && (
          <div className="sch-grid-2" style={{ marginBottom:10 }}>
            <TI label="Das" value={start} set={setStart}/>
            <TI label="Até" value={end}   set={setEnd}/>
          </div>
        )}

        <div style={{ display:'flex', gap:8, marginBottom:blocked.length>0?12:0 }}>
          <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="Motivo (opcional)"
            style={{ flex:1, padding:'9px 10px', fontSize:13, color:T.dark, background:T.off, border:`1.5px solid ${fr?T.sage:T.nude}`, borderRadius:T.r10, outline:'none', fontFamily:T.fontSans, minWidth:0 }}
            onFocus={()=>setFr(true)} onBlur={()=>setFr(false)}
            onKeyDown={e=>e.key==='Enter'&&add()}/>
          <button type="button" onClick={add} disabled={!date}
            style={{ width:40, height:40, borderRadius:T.r10, background:date?theme.primary:T.nude, border:'none', cursor:date?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0, transition:'background 0.15s' }}>
            <Plus size={16}/>
          </button>
        </div>

        {blocked.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {blocked.map((b,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 11px', background:T.off, borderRadius:T.r12, border:`1px solid ${T.nude}` }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{b.allDay?'📅':'🕐'}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:600, fontSize:13, color:T.dark, margin:0 }}>
                    {b.date}{!b.allDay?` · ${b.startTime}–${b.endTime}`:''}
                  </p>
                  {b.reason && <p style={{ fontSize:11, color:T.muted, margin:0 }}>{b.reason}</p>}
                </div>
                <button type="button" onClick={()=>onChange(blocked.filter((_,j)=>j!==i))}
                  style={{ background:'none', border:'none', cursor:'pointer', color:T.muted, display:'flex', flexShrink:0, transition:'color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color=T.red}
                  onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
                  <X size={14}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main export ────────────────────────────────────────────────────────────
interface ScheduleConfigProps {
  value:           WeekConfig
  onChange:        (w: WeekConfig) => void
  blocked:         BlockedSlot[]
  onBlockedChange: (b: BlockedSlot[]) => void
  theme?:          { primary:string; glow:string; pale:string }
  showBlocked?:    boolean
}

export default function ScheduleConfig({
  value, onChange, blocked, onBlockedChange,
  theme = { primary:T.sage, glow:T.sageG, pale:T.sageP },
  showBlocked = true,
}: ScheduleConfigProps) {
  function updateDay(i: number, cfg: DayConfig) {
    onChange({ ...value, [i]: cfg })
  }

  function copyToAll(cfg: DayConfig) {
    const next: WeekConfig = {}
    for (let i=0; i<7; i++) {
      next[i] = value[i].enabled ? { ...cfg, enabled:true } : { ...value[i] }
    }
    onChange(next)
  }

  const activeCount = Object.values(value).filter(d=>d.enabled).length

  return (
    <div>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }

        /* Two-column grid — stacks to single column on narrow screens */
        .sch-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 420px) {
          .sch-grid-2 {
            grid-template-columns: 1fr;
          }
          .sch-summary {
            display: none;
          }
        }
      `}</style>

      {/* Quick day toggles */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
        {DAYS_SHORT.map((d,i) => (
          <button key={i} type="button"
            onClick={()=>updateDay(i,{...value[i],enabled:!value[i].enabled})}
            style={{ padding:'7px 11px', borderRadius:T.r100, border:`2px solid ${value[i].enabled?theme.primary:T.nude}`, background:value[i].enabled?theme.primary:T.off, color:value[i].enabled?'#fff':T.muted, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:T.fontSans, transition:'all 0.15s', boxShadow:value[i].enabled?`0 2px 6px ${theme.primary}33`:'none' }}>
            {d}
          </button>
        ))}
        <span style={{ fontSize:12, color:T.muted, display:'flex', alignItems:'center', marginLeft:2 }}>
          {activeCount} dia{activeCount!==1?'s':''} ativo{activeCount!==1?'s':''}
        </span>
      </div>

      {/* Day cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:showBlocked?20:0 }}>
        {[0,1,2,3,4,5,6].map(i => (
          <DayCard key={i} dayIdx={i} cfg={value[i]}
            onChange={cfg=>updateDay(i,cfg)}
            theme={theme}
            onCopyToAll={copyToAll}/>
        ))}
      </div>

      {showBlocked && (
        <BlockedSlotsSection blocked={blocked} onChange={onBlockedChange} theme={theme}/>
      )}
    </div>
  )
}

// ─── Utilities ────────────────────────────────────────────────────────────
export function generateSlots(cfg: DayConfig): string[] {
  return previewSlots(cfg)
}

export function weekConfigToRows(profId: string, config: WeekConfig) {
  return Object.entries(config)
    .filter(([,cfg]) => cfg.enabled)
    .map(([dayIdx, cfg]) => ({
      professional_id: profId,
      day_of_week:     Number(dayIdx),
      start_time:      cfg.start + ':00',
      end_time:        cfg.end   + ':00',
      slot_minutes:    cfg.apptDuration,
      lunch_start:     cfg.lunchStart ? cfg.lunchStart + ':00' : null,
      lunch_end:       cfg.lunchEnd   ? cfg.lunchEnd   + ':00' : null,
      appt_duration:   cfg.apptDuration,
      break_minutes:   cfg.breakMins,
      active:          true,
    }))
}
