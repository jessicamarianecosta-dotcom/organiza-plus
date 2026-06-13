'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const C = { sage:'#7A9E87', sageG:'#EAF3EC', sageP:'#D6E8DA', sageL:'#A8C4AD', dark:'#2C3530', mid:'#5A6660', muted:'#8A9690', cream:'#FAFAF7', off:'#F7F5F0', nude:'#EDE8E0', white:'#FFFFFF', red:'#ef4444', redL:'#fef2f2', redB:'#fecaca' }

const PROFESSIONS = ['Psicólogo(a)','Psiquiatra','Nutricionista','Fisioterapeuta','Médico(a)','Dentista','Esteticista','Terapeuta','Coach','Educador Físico','Outro']

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,50)
}

function StyledInput({ label, type='text', value, onChange, placeholder, autoComplete, required=true }: any) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} required={required}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{ width:'100%', padding:'12px 16px', fontSize:14, color:C.dark, background:C.off, border:`2px solid ${focused?C.sage:C.nude}`, borderRadius:12, outline:'none', transition:'border-color 0.2s', fontFamily:'inherit' }}/>
    </div>
  )
}

function CadastroForm() {
  const router = useRouter()
  const params = useSearchParams()
  const plano = params.get('plano') || 'basic'
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [step, setStep] = useState<1|2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Step 1
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2
  const [profession, setProfession] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [city, setCity] = useState('')

  const steps = ['Sua conta','Perfil profissional']

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres.'); return }
    setError(''); setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profession) { setError('Selecione sua profissão.'); return }
    setLoading(true); setError('')

    try {
      // 1. Create auth user
      const { data: auth, error: authErr } = await supabase.auth.signUp({ email, password })
      if (authErr) throw new Error(authErr.message)
      const uid = auth.user?.id
      if (!uid) throw new Error('Erro ao criar usuário. Tente novamente.')

      // 2. Generate unique slug
      let slug = slugify(name)
      if (!slug) slug = `usuario-${Date.now()}`
      const { data: existing } = await supabase.from('profiles').select('slug').eq('slug', slug)
      if (existing && existing.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2,6)}`

      // 3. Create profile
      const { error: profileErr } = await supabase.from('profiles').insert({
        id: uid, name, slug, profession,
        whatsapp: whatsapp || null, city: city || null,
        plan: plano, plan_active: true,
        online: false, in_person: true,
      })
      if (profileErr) {
        // Profile might fail if user already exists - try to sign in instead
        console.error('Profile error:', profileErr)
      }

      // 4. Redirect to onboarding
      router.push('/onboarding')
    } catch (err: any) {
      const msg = err.message || 'Erro ao criar conta'
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('Este e-mail já está cadastrado. Faça login ou recupere sua senha.')
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'24px 16px', fontFamily:"'DM Sans', system-ui, sans-serif",
      background:`radial-gradient(ellipse 80% 60% at 50% -10%, rgba(122,158,135,0.12) 0%, transparent 60%), #F7F5F0`,
      opacity: mounted?1:0, transition:'opacity 0.4s ease',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap'); *{box-sizing:border-box;} input::placeholder{color:#8A9690;} select option{background:#fff;}`}</style>

      <div style={{ width:'100%', maxWidth:460 }}>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:C.muted, textDecoration:'none', marginBottom:24 }}
          onMouseEnter={e=>e.currentTarget.style.color=C.dark} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
          ← Voltar
        </Link>

        {/* Progress */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28 }}>
          {steps.map((s,i)=>(
            <div key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background: step>i+1 ? C.sage : step===i+1 ? C.dark : C.nude, color: step>=i+1 ? C.cream : C.muted, transition:'all 0.2s' }}>
                  {step>i+1 ? '✓' : i+1}
                </div>
                <span style={{ fontSize:13, fontWeight:step===i+1?600:400, color:step===i+1?C.dark:C.muted }}>{s}</span>
              </div>
              {i<steps.length-1 && <div style={{ width:32, height:2, borderRadius:2, background: step>i+1 ? C.sage : C.nude, transition:'background 0.3s' }}/>}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background:C.white, borderRadius:24, padding:'36px 36px 32px', boxShadow:'0 8px 40px rgba(44,53,48,0.10), 0 0 0 1px rgba(237,232,224,0.6)' }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:C.sage, display:'inline-block' }}/>
            <span style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:20, color:C.dark }}>
              Organiza<span style={{ color:C.sage }}>+</span>
            </span>
            <span style={{ marginLeft:'auto', background:C.sageG, color:C.sage, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:100, border:`1px solid ${C.sageP}` }}>
              {plano === 'premium' ? '💎 Premium' : '🌿 Basic'}
            </span>
          </div>

          <h1 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:24, color:C.dark, margin:'0 0 4px' }}>
            {step===1 ? 'Crie sua conta' : 'Perfil profissional'}
          </h1>
          <p style={{ fontSize:14, color:C.muted, margin:'0 0 24px' }}>
            {step===1 ? 'Preencha seus dados de acesso.' : 'Personalize sua página pública.'}
          </p>

          {/* Error */}
          {error && (
            <div style={{ background:C.redL, border:`1px solid ${C.redB}`, color:C.red, fontSize:13, padding:'11px 14px', borderRadius:10, marginBottom:18 }}>
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step===1 && (
            <form onSubmit={handleStep1}>
              <StyledInput label="Nome completo *" value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="Ex: Dra. Ana Beatriz Silva" autoComplete="name"/>
              <StyledInput label="E-mail *" type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email"/>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>Senha *</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres" autoComplete="new-password"
                    style={{ width:'100%', padding:'12px 44px 12px 16px', fontSize:14, color:C.dark, background:C.off, border:`2px solid ${C.nude}`, borderRadius:12, outline:'none', fontFamily:'inherit' }}
                    onFocus={e=>e.target.style.borderColor=C.sage} onBlur={e=>e.target.style.borderColor=C.nude}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.muted }}>
                    {showPw?'👁️':'🔒'}
                  </button>
                </div>
                <p style={{ fontSize:11, color:C.muted, marginTop:5 }}>Mínimo 6 caracteres</p>
              </div>
              <button type="submit" disabled={!name||!email||!password} style={{ width:'100%', padding:'14px', fontSize:15, fontWeight:700, color:C.cream, background:C.dark, border:'none', borderRadius:12, cursor:'pointer', fontFamily:'inherit', transition:'background 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=C.sage} onMouseLeave={e=>e.currentTarget.style.background=C.dark}>
                Continuar →
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step===2 && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>Profissão *</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {PROFESSIONS.map(p=>(
                    <button key={p} type="button" onClick={()=>{setProfession(p);setError('')}}
                      style={{ padding:'10px 12px', borderRadius:10, border:`2px solid ${profession===p?C.sage:C.nude}`, background:profession===p?C.sageG:C.off, color:profession===p?C.sage:C.mid, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s', textAlign:'left', fontFamily:'inherit' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <StyledInput label="WhatsApp" value={whatsapp} onChange={(e:any)=>setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" autoComplete="tel" required={false}/>
              <StyledInput label="Cidade" value={city} onChange={(e:any)=>setCity(e.target.value)} placeholder="São Paulo" required={false}/>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="button" onClick={()=>{setStep(1);setError('')}} style={{ padding:'14px 20px', border:`2px solid ${C.nude}`, background:'transparent', color:C.dark, borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.sage}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.nude}}>
                  ← Voltar
                </button>
                <button type="submit" disabled={loading||!profession} style={{ flex:1, padding:'14px', fontSize:15, fontWeight:700, color:C.cream, background:loading?C.muted:C.dark, border:'none', borderRadius:12, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', transition:'background 0.2s' }}
                  onMouseEnter={e=>{if(!loading)e.currentTarget.style.background=C.sage}} onMouseLeave={e=>{if(!loading)e.currentTarget.style.background=C.dark}}>
                  {loading ? 'Criando conta...' : 'Criar minha conta →'}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign:'center', marginTop:24, paddingTop:24, borderTop:`1px solid ${C.nude}` }}>
            <p style={{ fontSize:14, color:C.muted, margin:0 }}>
              Já tem conta?{' '}
              <Link href="/login" style={{ color:C.sage, fontWeight:700, textDecoration:'none' }}>Entrar</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:C.muted, marginTop:18 }}>🔒 Conexão segura · Dados protegidos</p>
      </div>
    </div>
  )
}

export default function Cadastro() {
  return <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F5F0', fontFamily:'system-ui' }}><p>Carregando...</p></div>}><CadastroForm/></Suspense>
}
