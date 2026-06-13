/**
 * Organiza+ Design System
 * All styles are inline — zero Tailwind dependency
 * Import this in every page for consistent premium UI
 */
import React, { useState, CSSProperties } from 'react'

// ─── TOKENS ──────────────────────────────────────────────────────────────────
export const T = {
  // Colors
  sage:    '#7A9E87',
  sageL:   '#A8C4AD',
  sageP:   '#D6E8DA',
  sageG:   '#EAF3EC',
  dark:    '#2C3530',
  mid:     '#5A6660',
  muted:   '#8A9690',
  cream:   '#FAFAF7',
  off:     '#F7F5F0',
  nude:    '#EDE8E0',
  begeP:   '#F4EFE8',
  white:   '#FFFFFF',
  // Status
  green:   '#16a34a',
  greenL:  '#dcfce7',
  greenB:  '#86efac',
  amber:   '#d97706',
  amberL:  '#fffbeb',
  amberB:  '#fcd34d',
  red:     '#ef4444',
  redL:    '#fef2f2',
  redB:    '#fecaca',
  blue:    '#3b82f6',
  blueL:   '#eff6ff',
  blueB:   '#bfdbfe',
  // Font
  fontSans:    "'DM Sans', system-ui, -apple-system, sans-serif",
  fontSerif:   "'DM Serif Display', Georgia, serif",
  // Radius
  r4:  4, r8: 8, r10: 10, r12: 12, r14: 14, r16: 16, r20: 20, r24: 24, r28: 28, r100: 100,
  // Shadow
  shadowSm:  '0 1px 6px rgba(44,53,48,0.05)',
  shadowMd:  '0 4px 16px rgba(44,53,48,0.08)',
  shadowLg:  '0 8px 40px rgba(44,53,48,0.12)',
  shadowXl:  '0 20px 64px rgba(44,53,48,0.14)',
  shadowCard:'0 2px 12px rgba(44,53,48,0.06), 0 0 0 1px rgba(237,232,224,0.7)',
}

// ─── GLOBAL STYLES INJECTOR ──────────────────────────────────────────────────
export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Serif+Display:ital@0;1&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; overflow-x: hidden; }
      input, textarea, select, button { font-family: inherit; }
      input::placeholder, textarea::placeholder { color: #8A9690; }
      a { text-decoration: none; }
      @keyframes fadeIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes scaleIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
      @keyframes float1  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      @keyframes float2  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
      @keyframes spin    { to { transform: rotate(360deg); } }
      .anim-fade { animation: fadeIn 0.4s ease both; }
      .anim-up   { animation: fadeUp 0.5s ease both; }
      .anim-scale{ animation: scaleIn 0.35s ease both; }
    `}</style>
  )
}

// ─── PAGE WRAPPER ────────────────────────────────────────────────────────────
export function PageBg({ children, center, gradient }: { children: React.ReactNode, center?: boolean, gradient?: boolean }) {
  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: T.fontSans,
      background: gradient
        ? `radial-gradient(ellipse 90% 55% at 50% -5%, rgba(122,158,135,0.14) 0%, transparent 65%), ${T.cream}`
        : T.off,
      color: T.dark,
      ...(center ? { display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' } : {}),
    }}>
      <GlobalStyles/>
      {children}
    </div>
  )
}

// ─── CARD ────────────────────────────────────────────────────────────────────
export function Card({ children, style, hover, p=28 }: { children: React.ReactNode, style?: CSSProperties, hover?: boolean, p?: number }) {
  const [h, setH] = useState(false)
  return (
    <div
      onMouseEnter={()=>hover&&setH(true)}
      onMouseLeave={()=>hover&&setH(false)}
      style={{
        background: T.white,
        borderRadius: T.r20,
        boxShadow: h ? T.shadowLg : T.shadowCard,
        padding: p,
        transition: 'all 0.2s ease',
        transform: h ? 'translateY(-3px)' : 'none',
        ...style,
      }}>
      {children}
    </div>
  )
}

// ─── BUTTON ──────────────────────────────────────────────────────────────────
type BtnVariant = 'primary'|'secondary'|'outline'|'ghost'|'danger'|'sage'
export function Btn({
  children, onClick, type='button', variant='primary', size='md',
  disabled, loading, full, icon, style
}: {
  children: React.ReactNode, onClick?: ()=>void, type?: 'button'|'submit'|'reset',
  variant?: BtnVariant, size?: 'sm'|'md'|'lg', disabled?: boolean,
  loading?: boolean, full?: boolean, icon?: React.ReactNode, style?: CSSProperties
}) {
  const [h, setH] = useState(false)
  const sizes = { sm:{ padding:'8px 16px', fontSize:13, borderRadius:T.r10 }, md:{ padding:'12px 22px', fontSize:14, borderRadius:T.r12 }, lg:{ padding:'15px 32px', fontSize:16, borderRadius:T.r14 } }
  const variants: Record<BtnVariant, { bg:string, bgH:string, color:string, border?:string, borderH?:string }> = {
    primary:   { bg:T.dark,  bgH:T.sage,  color:T.cream },
    sage:      { bg:T.sage,  bgH:T.sageL, color:T.cream },
    secondary: { bg:T.off,   bgH:T.sageG, color:T.dark,  border:`2px solid ${T.nude}`, borderH:`2px solid ${T.sageL}` },
    outline:   { bg:'transparent', bgH:T.sageG, color:T.dark, border:`2px solid ${T.nude}`, borderH:`2px solid ${T.sage}` },
    ghost:     { bg:'transparent', bgH:T.sageG, color:T.mid },
    danger:    { bg:T.red,   bgH:'#dc2626', color:'#fff' },
  }
  const v = variants[variant]
  const s = sizes[size]
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
        padding: s.padding, fontSize: s.fontSize, fontWeight: 600,
        borderRadius: s.borderRadius, border: (h&&v.borderH)?v.borderH : v.border||'none',
        background: h ? v.bgH : v.bg, color: v.color,
        cursor: (disabled||loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled||loading) ? 0.5 : 1,
        transition: 'all 0.2s ease',
        width: full ? '100%' : undefined,
        fontFamily: T.fontSans,
        boxShadow: variant==='primary'||variant==='sage' ? (h?'0 6px 20px rgba(44,53,48,0.18)':'0 2px 8px rgba(44,53,48,0.10)') : 'none',
        ...style,
      }}>
      {loading ? <span style={{ width:15, height:15, border:`2px solid currentColor`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }}/> : icon}
      {children}
    </button>
  )
}

// ─── INPUT ───────────────────────────────────────────────────────────────────
export function Input({ label, hint, error: err, type='text', value, onChange, placeholder, autoComplete, required, disabled, rows, suffix }: {
  label?: string, hint?: string, error?: string, type?: string, value: string,
  onChange: (v:string)=>void, placeholder?: string, autoComplete?: string,
  required?: boolean, disabled?: boolean, rows?: number, suffix?: React.ReactNode
}) {
  const [f, setF] = useState(false)
  const border = err ? `2px solid ${T.red}` : f ? `2px solid ${T.sage}` : `2px solid ${T.nude}`
  const base: CSSProperties = {
    width:'100%', padding:'12px 16px', fontSize:14, color:T.dark,
    background: disabled ? T.nude : T.off, border, borderRadius:T.r12,
    outline:'none', fontFamily:T.fontSans, transition:'border-color 0.2s',
    resize: rows ? 'vertical' : undefined,
  }
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>{label}{required && <span style={{ color:T.sage, marginLeft:3 }}>*</span>}</label>}
      <div style={{ position:'relative' }}>
        {rows
          ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} required={required} disabled={disabled} style={base} onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
          : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} required={required} disabled={disabled} style={{ ...base, paddingRight: suffix?'44px':undefined }} onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
        }
        {suffix && <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', cursor:'pointer', color:T.muted }}>{suffix}</span>}
      </div>
      {hint && !err && <p style={{ fontSize:11, color:T.muted, marginTop:5 }}>{hint}</p>}
      {err && <p style={{ fontSize:11, color:T.red, marginTop:5 }}>⚠ {err}</p>}
    </div>
  )
}

// ─── SELECT ──────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, required }: { label?: string, value:string, onChange:(v:string)=>void, options:{value:string,label:string}[], required?:boolean }) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>{label}{required && <span style={{ color:T.sage, marginLeft:3 }}>*</span>}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} required={required}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ width:'100%', padding:'12px 16px', fontSize:14, color:T.dark, background:T.off, border:`2px solid ${f?T.sage:T.nude}`, borderRadius:T.r12, outline:'none', fontFamily:T.fontSans, appearance:'none', cursor:'pointer' }}>
        <option value="">Selecione...</option>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
export function Badge({ children, color='sage' }: { children: React.ReactNode, color?: 'sage'|'amber'|'red'|'blue'|'green'|'dark' }) {
  const map = {
    sage:  { bg:T.sageG, color:T.sage, border:T.sageP },
    amber: { bg:T.amberL, color:T.amber, border:T.amberB },
    red:   { bg:T.redL, color:T.red, border:T.redB },
    blue:  { bg:T.blueL, color:T.blue, border:T.blueB },
    green: { bg:T.greenL, color:T.green, border:T.greenB },
    dark:  { bg:T.dark, color:T.cream, border:T.dark },
  }
  const c = map[color]
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:T.r100, padding:'4px 11px', fontSize:11, fontWeight:700, letterSpacing:'0.02em' }}>
      {children}
    </span>
  )
}

// ─── CHIP LABEL ──────────────────────────────────────────────────────────────
export function Chip({ children, dark }: { children: React.ReactNode, dark?: boolean }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:dark?'rgba(122,158,135,0.15)':T.sageG, border:`1px solid ${dark?'rgba(122,158,135,0.25)':T.sageP}`, borderRadius:T.r100, padding:'5px 15px', fontSize:12, fontWeight:600, color:dark?T.sageL:T.sage, marginBottom:18 }}>
      {children}
    </div>
  )
}

// ─── HEADING ─────────────────────────────────────────────────────────────────
export function H1({ children, style }: { children: React.ReactNode, style?: CSSProperties }) {
  return <h1 style={{ fontFamily:T.fontSerif, fontSize:'clamp(36px,6vw,72px)', lineHeight:1.08, letterSpacing:'-0.025em', color:T.dark, ...style }}>{children}</h1>
}
export function H2({ children, style }: { children: React.ReactNode, style?: CSSProperties }) {
  return <h2 style={{ fontFamily:T.fontSerif, fontSize:'clamp(26px,4vw,44px)', lineHeight:1.12, color:T.dark, marginBottom:12, ...style }}>{children}</h2>
}
export function H3({ children, style }: { children: React.ReactNode, style?: CSSProperties }) {
  return <h3 style={{ fontFamily:T.fontSerif, fontSize:'clamp(20px,3vw,28px)', lineHeight:1.2, color:T.dark, marginBottom:8, ...style }}>{children}</h3>
}

// ─── LOGO ────────────────────────────────────────────────────────────────────
export function Logo({ size=20 }: { size?: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:size*0.45, height:size*0.45, borderRadius:'50%', background:T.sage }}/>
      <span style={{ fontFamily:T.fontSerif, fontSize:size, color:T.dark, lineHeight:1 }}>
        Organiza<span style={{ color:T.sage }}>+</span>
      </span>
    </div>
  )
}

// ─── DIVIDER ─────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
      <div style={{ flex:1, height:1, background:T.nude }}/>
      {label && <span style={{ fontSize:12, color:T.muted, fontWeight:500, whiteSpace:'nowrap' }}>{label}</span>}
      <div style={{ flex:1, height:1, background:T.nude }}/>
    </div>
  )
}

// ─── ALERT ───────────────────────────────────────────────────────────────────
export function Alert({ children, type='error' }: { children: React.ReactNode, type?: 'error'|'success'|'warning'|'info' }) {
  const map = { error:{bg:T.redL,border:T.redB,color:T.red,icon:'⚠'}, success:{bg:T.greenL,border:T.greenB,color:T.green,icon:'✓'}, warning:{bg:T.amberL,border:T.amberB,color:T.amber,icon:'!'}, info:{bg:T.blueL,border:T.blueB,color:T.blue,icon:'ℹ'} }
  const c = map[type]
  return (
    <div style={{ background:c.bg, border:`1px solid ${c.border}`, color:c.color, fontSize:13, fontWeight:500, padding:'12px 14px', borderRadius:T.r12, marginBottom:18, display:'flex', alignItems:'flex-start', gap:8 }}>
      <span style={{ fontWeight:700 }}>{c.icon}</span>
      <span>{children}</span>
    </div>
  )
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────
export function ProgressBar({ current, total, label }: { current: number, total: number, label?: string }) {
  const pct = Math.round((current/total)*100)
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        {label && <span style={{ fontSize:12, fontWeight:600, color:T.muted }}>{label}</span>}
        <span style={{ fontSize:12, fontWeight:700, color:T.sage, marginLeft:'auto' }}>Passo {current} de {total}</span>
      </div>
      <div style={{ height:4, background:T.nude, borderRadius:T.r4, overflow:'hidden' }}>
        <div style={{ height:'100%', background:T.sage, width:`${pct}%`, borderRadius:T.r4, transition:'width 0.4s ease' }}/>
      </div>
    </div>
  )
}

// ─── STATUS DOT ──────────────────────────────────────────────────────────────
export function StatusDot({ status }: { status: 'pending'|'confirmed'|'cancelled'|'completed' }) {
  const map = { pending:{color:T.amber,label:'Pendente'}, confirmed:{color:T.sage,label:'Confirmado'}, cancelled:{color:T.red,label:'Cancelado'}, completed:{color:T.blue,label:'Concluído'} }
  const s = map[status]
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, color:s.color }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.color, display:'inline-block' }}/>
      {s.label}
    </span>
  )
}

// ─── INNER CONTAINER ─────────────────────────────────────────────────────────
export function Inner({ children, style, max=1080 }: { children: React.ReactNode, style?: CSSProperties, max?: number }) {
  return <div style={{ maxWidth:max, margin:'0 auto', ...style }}>{children}</div>
}

// ─── SECTION ─────────────────────────────────────────────────────────────────
export function Section({ children, bg, py=96, px=24, id }: { children: React.ReactNode, bg?: string, py?: number, px?: number, id?: string }) {
  return <section id={id} style={{ padding:`${py}px ${px}px`, background:bg||T.cream }}>{children}</section>
}

// ─── GRID ────────────────────────────────────────────────────────────────────
export function Grid({ children, cols=2, gap=20, style }: { children: React.ReactNode, cols?: number, gap?: number, style?: CSSProperties }) {
  return <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fit, minmax(${cols===2?300:cols===3?240:200}px,1fr))`, gap, ...style }}>{children}</div>
}

// ─── SKELETON ────────────────────────────────────────────────────────────────
export function Skeleton({ w='100%', h=16, r=8 }: { w?: string|number, h?: number, r?: number }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:`linear-gradient(90deg, ${T.nude} 25%, ${T.off} 50%, ${T.nude} 75%)`, backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}/>
}
