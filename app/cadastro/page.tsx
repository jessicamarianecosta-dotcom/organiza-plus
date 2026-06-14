'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const C = { sage:'#7A9E87', sageG:'#EAF3EC', sageP:'#D6E8DA', dark:'#2C3530', mid:'#5A6660', muted:'#8A9690', cream:'#FAFAF7', off:'#F7F5F0', nude:'#EDE8E0', white:'#FFFFFF', red:'#ef4444', redL:'#fef2f2', redB:'#fecaca' }
const PROFESSIONS = ['Psicólogo(a)','Psiquiatra','Nutricionista','Fisioterapeuta','Médico(a)','Dentista','Esteticista','Terapeuta','Coach','Educador Físico','Outro']

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').slice(0,50) || `user-${Date.now()}`
}

function FI({ label, type='text', value, set, placeholder, auto, req=true }: any) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} autoComplete={auto} required={req}
        style={{ width:'100%', padding:'12px 16px', fontSize:14, color:C.dark, background:C.off, border:`2px solid ${f?C.sage:C.nude}`, borderRadius:12, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
    </div>
  )
}

function CadastroForm() {
  const router = useRouter()
  const params = useSearchParams()
  const plano = params.get('plano') || 'basic'

  const [checking, setChecking] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<1|2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profession, setProfession] = useState('')
  const [customProf, setCustomProf] = useState('')

  useEffect(() => {
    setMounted(true)
    // If already logged in, redirect
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('onboarding_done').eq('id', user.id).single()
          .then(({ data: p }) => {
            router.push(p?.onboarding_done ? '/dashboard' : '/onboarding')
          })
      } else {
        setChecking(false)
      }
    })
  }, [router])

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
      // 1. Sign up — trigger will auto-create the profile
      const { data, error: signupErr } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { name, profession, plan: plano } // passed to trigger via raw_user_meta_data
        }
      })

      if (signupErr) {
        if (signupErr.message.includes('already registered')) {
          setError('Este e-mail já está cadastrado. Faça login ou recupere sua senha.')
        } else {
          setError(signupErr.message)
        }
        setLoading(false); return
      }

      const uid = data.user?.id
      if (!uid) { setError('Erro ao criar conta. Tente novamente.'); setLoading(false); return }
      const finalProfession = profession === 'Outro' ? (customProf.trim() || 'Outro') : profession

      // 2. Update profile with name + profession (trigger may have used email as name)
      let slug = slugify(name)
      const { data: existing } = await supabase.from('profiles').select('slug').eq('slug', slug).neq('id', uid)
      if (existing && existing.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2,5)}`

      await supabase.from('profiles').upsert({
        id: uid, name, slug, profession: finalProfession, plan: plano,
        plan_active: true, online: false, in_person: true, onboarding_done: false,
      })

      // 3. Sign in immediately (if email confirmation disabled)
      const { data: signInData } = await supabase.auth.signInWithPassword({ email, password })

      if (signInData?.user) {
        router.push('/onboarding')
      } else {
        // Email confirmation required
        router.push('/confirmar-email?email=' + encodeURIComponent(email))
      }

    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F5F0' }}>
        <p style={{ fontFamily:'Georgia,serif', fontSize:20, color:'#2C3530' }}>Organiza<span style={{ color:'#7A9E87' }}>+</span></p>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:"'DM Sans',system-ui,sans-serif", background:`radial-gradient(ellipse 80% 60% at 50% -10%, rgba(122,158,135,0.13) 0%, transparent 60%), #F7F5F0`, opacity:mounted?1:0, transition:'opacity 0.4s' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap'); *{box-sizing:border-box} input::placeholder{color:#8A9690}`}</style>
      <div style={{ width:'100%', maxWidth:460 }}>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:C.muted, textDecoration:'none', marginBottom:24 }}
          onMouseEnter={e=>e.currentTarget.style.color=C.dark} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
          ← Voltar
        </Link>

        {/* Progress bar */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>Passo {step} de 2</span>
            <span style={{ fontSize:12, color:C.sage, fontWeight:600 }}>{step===1?'Dados de acesso':'Perfil profissional'}</span>
          </div>
          <div style={{ height:4, background:C.nude, borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', background:C.sage, width:step===1?'50%':'100%', borderRadius:4, transition:'width 0.4s ease' }}/>
          </div>
        </div>

        <div style={{ background:C.white, borderRadius:24, padding:'36px', boxShadow:'0 8px 40px rgba(44,53,48,0.10), 0 0 0 1px rgba(237,232,224,0.5)' }}>
          {/* Logo + plano */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:C.sage, display:'inline-block' }}/>
              <span style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:20, color:C.dark }}>Organiza<span style={{ color:C.sage }}>+</span></span>
            </div>
            <span style={{ background:C.sageG, color:C.sage, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:100, border:`1px solid ${C.sageP}` }}>
              {plano==='premium'?'💎 Premium':'🌿 Basic'}
            </span>
          </div>

          <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:24, color:C.dark, margin:'0 0 4px' }}>
            {step===1?'Crie sua conta':'Sua profissão'}
          </h1>
          <p style={{ fontSize:14, color:C.muted, margin:'0 0 24px' }}>
            {step===1?'Dados para acessar o sistema.':'Escolha sua área de atuação.'}
          </p>

          {error && (
            <div style={{ background:C.redL, border:`1px solid ${C.redB}`, color:C.red, fontSize:13, padding:'12px 14px', borderRadius:10, marginBottom:18 }}>
              {error}
            </div>
          )}

          {step===1 && (
            <form onSubmit={handleStep1}>
              <FI label="Nome completo *" value={name} set={setName} placeholder="Ex: Dra. Ana Beatriz Silva" auto="name"/>
              <FI label="E-mail *" type="email" value={email} set={setEmail} placeholder="seu@email.com" auto="email"/>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>Senha *</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                    style={{ width:'100%', padding:'12px 44px 12px 16px', fontSize:14, color:C.dark, background:C.off, border:`2px solid ${C.nude}`, borderRadius:12, outline:'none', fontFamily:'inherit' }}
                    onFocus={e=>e.target.style.borderColor=C.sage} onBlur={e=>e.target.style.borderColor=C.nude}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.muted }}>
                    {showPw?'🙈':'👁️'}
                  </button>
                </div>
                <p style={{ fontSize:11, color:C.muted, marginTop:5 }}>Mínimo 6 caracteres</p>
              </div>
              <button type="submit" disabled={!name||!email||!password}
                style={{ width:'100%', padding:'14px', fontSize:15, fontWeight:700, color:C.cream, background:C.dark, border:'none', borderRadius:12, cursor:'pointer', fontFamily:'inherit', transition:'background 0.2s', opacity:(!name||!email||!password)?0.4:1 }}
                onMouseEnter={e=>e.currentTarget.style.background=C.sage} onMouseLeave={e=>e.currentTarget.style.background=C.dark}>
                Continuar →
              </button>
            </form>
          )}

          {step===2 && (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize:13, fontWeight:600, color:C.dark, marginBottom:12 }}>Selecione sua profissão *</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
                {PROFESSIONS.map(p=>(
                  <button key={p} type="button" onClick={()=>{setProfession(p);setError('')}}
                    style={{ padding:'10px 12px', borderRadius:10, border:`2px solid ${profession===p?C.sage:C.nude}`, background:profession===p?C.sageG:C.off, color:profession===p?C.sage:C.mid, fontSize:12, fontWeight:600, cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'all 0.15s' }}>
                    {p}
                  </button>
                ))}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" onClick={()=>{setStep(1);setError('')}}
                  style={{ padding:'14px 18px', border:`2px solid ${C.nude}`, background:'transparent', color:C.dark, borderRadius:12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.sage} onMouseLeave={e=>e.currentTarget.style.borderColor=C.nude}>
                  ←
                </button>
                <button type="submit" disabled={loading||!profession}
                  style={{ flex:1, padding:'14px', fontSize:15, fontWeight:700, color:C.cream, background:loading?C.muted:C.dark, border:'none', borderRadius:12, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', transition:'background 0.2s', opacity:(!profession||(profession==='Outro'&&!customProf.trim()))?0.4:1 }}
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
        <p style={{ textAlign:'center', fontSize:12, color:C.muted, marginTop:16 }}>🔒 Conexão segura · Dados protegidos</p>
      </div>
    </div>
  )
}

export default function Cadastro() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F5F0' }}><p style={{ fontFamily:'Georgia,serif', color:'#2C3530', fontSize:20 }}>Organiza<span style={{ color:'#7A9E87' }}>+</span></p></div>}>
      <CadastroForm/>
    </Suspense>
  )
}
