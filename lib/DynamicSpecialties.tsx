'use client'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { T } from '@/lib/ds'
import { Plus, X } from 'lucide-react'

// ── Pre-defined specialties per profession ─────────────────────────────────
export const SPECS_BY_PROFESSION: Record<string, string[]> = {
  'Psicólogo(a)':    ['Ansiedade','Depressão','TCC','Psicanálise','Relacionamentos','Autoconhecimento','TDAH','Trauma','Autoestima','Burnout','Luto','Fobias'],
  'Psiquiatra':      ['Depressão','Ansiedade','Transtorno Bipolar','TDAH','TOC','Esquizofrenia','Dependência Química','Insônia','Burnout','Transtorno de Personalidade'],
  'Nutricionista':   ['Emagrecimento','Hipertrofia','Diabetes','Vegano/Vegetariano','Alimentação Esportiva','Nutrição Funcional','Saúde Intestinal','Gestação','Oncológica','Infantil'],
  'Fisioterapeuta':  ['Ortopedia','Neurológica','Pós-operatório','Pilates','RPG','Estética','Respiratória','Pediatria','Geriatria','Dor Crônica'],
  'Médico(a)':       ['Clínica Geral','Cardiologia','Dermatologia','Endocrinologia','Ginecologia','Ortopedia','Saúde Preventiva','Check-up','Doenças Crônicas'],
  'Dentista':        ['Clínica Geral','Ortodontia','Implante','Estética','Endodontia','Periodontia','Odontopediatria','Harmonização Facial','Prótese'],
  'Esteticista':     ['Limpeza de Pele','Facial','Corporal','Drenagem','Massagem','Microagulhamento','Depilação','Laser','Peeling','Radiofrequência'],
  'Terapeuta':       ['Reiki','Acupuntura','Constelação Familiar','Hipnoterapia','Aromaterapia','Meditação','Barras de Access','Thetahealing','Terapia Holística'],
  'Coach':           ['Life Coaching','Executive Coaching','Carreira','Relacionamentos','Financeiro','Liderança','Alta Performance','Propósito','Mindset'],
  'Educador Físico': ['Personal Trainer','Musculação','Emagrecimento','Hipertrofia','Funcional','Cardio','Pilates','CrossFit','Esportes','Natação'],
}

export function getDefaultSpecs(profession: string): string[] {
  return SPECS_BY_PROFESSION[profession] || []
}

interface Props {
  profession: string
  value: string[]
  onChange: (specs: string[]) => void
  theme?: { primary: string; dark: string; glow: string; pale: string; light: string }
}

export default function DynamicSpecialties({ profession, value, onChange, theme }: Props) {
  const th = theme || { primary:T.sage, dark:T.dark, glow:T.sageG, pale:T.sageP, light:T.sageL }
  const presets = getDefaultSpecs(profession)
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [inputErr, setInputErr] = useState('')
  const [animating, setAnimating] = useState<string|null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus()
  }, [showInput])

  function toggle(spec: string) {
    setAnimating(spec)
    setTimeout(() => setAnimating(null), 300)
    if (value.includes(spec)) {
      onChange(value.filter(s => s !== spec))
    } else {
      onChange([...value, spec])
    }
  }

  function addCustom() {
    const trimmed = input.trim()
    setInputErr('')
    if (!trimmed) { setInputErr('Digite uma especialidade.'); return }
    if (trimmed.length > 30) { setInputErr('Máximo 30 caracteres.'); return }
    if (value.map(s=>s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setInputErr('Já adicionada.'); return
    }
    setAnimating(trimmed)
    setTimeout(() => setAnimating(null), 300)
    onChange([...value, trimmed])
    setInput('')
    setShowInput(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addCustom() }
    if (e.key === 'Escape') { setShowInput(false); setInput(''); setInputErr('') }
  }

  function removeCustom(spec: string) {
    onChange(value.filter(s => s !== spec))
  }

  // Custom specs = selected but NOT in presets
  const customSpecs = value.filter(s => !presets.includes(s))

  return (
    <div>
      <style>{`
        @keyframes tagPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes tagRemove {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.7); opacity: 0; }
        }
        .spec-tag { transition: all 0.15s ease; }
        .spec-tag:hover { transform: translateY(-1px); }
        .spec-tag-new { animation: tagPop 0.3s ease both; }
      `}</style>

      {/* ── Preset specialties ─── */}
      {presets.length > 0 && (
        <div style={{ marginBottom: customSpecs.length > 0 || showInput ? 12 : 0 }}>
          <p style={{ fontSize:12, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>
            Especialidades sugeridas
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {presets.map(s => {
              const selected = value.includes(s)
              return (
                <button key={s} type="button" onClick={()=>toggle(s)}
                  className={`spec-tag${animating===s?' spec-tag-new':''}`}
                  style={{
                    padding:'7px 14px', borderRadius:T.r100, fontSize:12, fontWeight:600,
                    border:`2px solid ${selected?th.primary:T.nude}`,
                    background: selected ? th.primary : T.white,
                    color: selected ? T.cream : T.mid,
                    cursor:'pointer', fontFamily:T.fontSans,
                    display:'flex', alignItems:'center', gap:6,
                    boxShadow: selected ? `0 2px 8px ${th.primary}33` : 'none',
                  }}>
                  {selected && <span style={{ fontSize:10, fontWeight:800 }}>✓</span>}
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Custom specialties ─── */}
      {customSpecs.length > 0 && (
        <div style={{ marginBottom:12 }}>
          <p style={{ fontSize:12, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>
            Minhas especialidades
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {customSpecs.map(s => (
              <div key={s}
                className={`spec-tag${animating===s?' spec-tag-new':''}`}
                style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  padding:'7px 12px', borderRadius:T.r100, fontSize:12, fontWeight:600,
                  background:th.glow, border:`2px solid ${th.pale}`, color:th.primary,
                }}>
                <span>✦</span>
                {s}
                <button type="button" onClick={()=>removeCustom(s)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:th.primary, padding:0, display:'flex', alignItems:'center', opacity:0.7, lineHeight:1 }}
                  onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='0.7'}>
                  <X size={12}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add custom input ─── */}
      <div style={{ marginTop: (presets.length > 0 || customSpecs.length > 0) ? 4 : 0 }}>
        {!showInput ? (
          <button type="button" onClick={()=>setShowInput(true)}
            style={{
              display:'inline-flex', alignItems:'center', gap:7,
              padding:'8px 16px', borderRadius:T.r100, fontSize:12, fontWeight:700,
              background:'transparent', border:`2px dashed ${T.nude}`,
              color:T.muted, cursor:'pointer', fontFamily:T.fontSans, transition:'all 0.15s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=th.primary;e.currentTarget.style.color=th.primary;e.currentTarget.style.background=th.glow}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.nude;e.currentTarget.style.color=T.muted;e.currentTarget.style.background='transparent'}}>
            <Plus size={13}/> Adicionar especialidade
          </button>
        ) : (
          <div style={{ animation:'tagPop 0.25s ease both' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ position:'relative', flex:1 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e=>{ setInput(e.target.value.slice(0,30)); setInputErr('') }}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite uma especialidade..."
                  maxLength={30}
                  style={{
                    width:'100%', padding:'10px 14px', fontSize:13, color:T.dark,
                    background:T.white, border:`2px solid ${inputErr?T.red:th.primary}`,
                    borderRadius:T.r12, outline:'none', fontFamily:T.fontSans,
                    boxShadow:`0 2px 12px ${th.primary}20`,
                  }}/>
                <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:10, color:T.muted }}>
                  {input.length}/30
                </span>
              </div>
              <button type="button" onClick={addCustom}
                style={{ width:38, height:38, borderRadius:T.r12, background:th.primary, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:T.cream, flexShrink:0, transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background=th.dark}
                onMouseLeave={e=>e.currentTarget.style.background=th.primary}>
                <Plus size={16}/>
              </button>
              <button type="button" onClick={()=>{setShowInput(false);setInput('');setInputErr('')}}
                style={{ width:38, height:38, borderRadius:T.r12, background:T.off, border:`1px solid ${T.nude}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:T.muted, flexShrink:0, transition:'all 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background=T.nude}
                onMouseLeave={e=>e.currentTarget.style.background=T.off}>
                <X size={15}/>
              </button>
            </div>
            {inputErr && <p style={{ fontSize:11, color:T.red, marginTop:5, marginLeft:2 }}>⚠ {inputErr}</p>}
            <p style={{ fontSize:11, color:T.muted, marginTop:5, marginLeft:2 }}>
              Enter para confirmar · Esc para cancelar
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {value.length > 0 && (
        <div style={{ marginTop:14, padding:'10px 14px', background:th.glow, borderRadius:T.r12, border:`1px solid ${th.pale}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:12, color:th.primary, fontWeight:600 }}>
            {value.length} especialidade{value.length!==1?'s':''} selecionada{value.length!==1?'s':''}
          </span>
          <button type="button" onClick={()=>onChange([])}
            style={{ fontSize:11, color:th.primary, background:'none', border:'none', cursor:'pointer', fontFamily:T.fontSans, opacity:0.7, fontWeight:600 }}
            onMouseEnter={e=>e.currentTarget.style.opacity='1'}
            onMouseLeave={e=>e.currentTarget.style.opacity='0.7'}>
            Limpar todas
          </button>
        </div>
      )}
    </div>
  )
}
