'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { T, GlobalStyles } from '@/lib/ds'

const PROFESSIONS = [
  'Psicólogo(a)','Psiquiatra','Nutricionista','Fisioterapeuta','Médico(a)',
  'Dentista','Esteticista','Terapeuta','Coach','Educador Físico','Outro',
]

function slugify(s: string) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    .replace(/-+/g, '-').slice(0, 40) || `user-${Date.now()}`
}

function FI({ label, type='text', value, set, placeholder, auto, error, hint }: any) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>
        {label}
      </label>
      <input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder}
        autoComplete={auto}
        style={{ width:'100%', padding:'12px 16px', fontSize:14, color:T.dark, background:T.off, border:`2px solid ${error?T.red:f?T.sage:T.nude}`, borderRadius:T.r12, outline:'none', fontFamily:T.fontSans, transition:'border-color 0.2s' }}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
      {error && <p style={{ fontSize:11, color:T.red, marginTop:5 }}>⚠ {error}</p>}
      {hint && !error && <p style={{ fontSize:11, color:T.muted, marginTop:5 }}>{hint}</p>}
    </div>
  )
}

function Btn({ children, onClick, disabled, loading, type='button', variant='primary' }: any) {
  const [h, setH] = useState(false)
  const isPrimary = variant === 'primary'
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        width:'100%', padding:'14px', fontSize:15, fontWeight:700,
        color: isPrimary ? T.cream : T.dark,
        background: isPrimary ? (h&&!(disabled||loading) ? T.sage : T.dark) : 'transparent',
        border: isPrimary ? 'none' : `2px solid ${h?T.sageL:T.nude}`,
        borderRadius:T.r12, cursor:(disabled||loading)?'not-allowed':'pointer',
        fontFamily:T.fontSans, transition:'all 0.2s', opacity:(disabled||loading)?0.5:1,
      }}>
      {loading && <span style={{ width:16, height:16, border:`2px solid ${T.cream}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block', flexShrink:0 }}/>}
      {children}
    </button>
  )
}

function CadastroForm() {
  const router = useRouter()
  const params = useSearchParams()
  const plano  = params.get('plano') || 'basic'

  const [mounted,  setMounted]  = useState(false)
  const [checking, setChecking] = useState(true)
  const [step,     setStep]     = useState<1|2>(1)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPw,   setShowPw]   = useState(false)

  // Step 1 fields
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  // Step 1 field errors
  const [nameErr, setNameErr]   = useState('')
  const [emailErr, setEmailErr] = useState('')
  const [pwErr,   setPwErr]     = useState('')

  // Step 2 fields
  const [profession,   setProfession]   = useState('')
  const [customProf,   setCustomProf]   = useState('')
  const [profErr,      setProfErr]      = useState('')

  useEffect(() => {
    setMounted(true)
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

  function validateStep1() {
    let ok = true
    setNameErr(''); setEmailErr(''); setPwErr('')
    if (!name.trim() || name.trim().length < 2) { setNameErr('Nome precisa ter ao menos 2 caracteres.'); ok=false }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr('E-mail inválido.'); ok=false }
    if (password.length < 6) { setPwErr('Senha precisa ter ao menos 6 caracteres.'); ok=false }
    return ok
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!validateStep1()) return
    setError(''); setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalProf = profession === 'Outro' ? (customProf.trim() || 'Outro') : profession
    if (!finalProf) { setProfErr('Selecione ou informe sua profissão.'); return }
    setProfErr(''); setError(''); setLoading(true)

    try {
      // 1️⃣ Sign up — trigger will auto-create profile server-side
      const { data, error: signupErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            profession: finalProf,
            plan: plano,
          }
        }
      })

      if (signupErr) {
        if (signupErr.message.includes('already registered') || signupErr.message.includes('already been registered')) {
          setError('Este e-mail já está cadastrado. Faça login ou recupere sua senha.')
        } else if (signupErr.message.includes('Password')) {
          setError('Senha muito fraca. Use ao menos 6 caracteres com letras e números.')
        } else if (signupErr.message.includes('valid email')) {
          setError('E-mail inválido. Verifique e tente novamente.')
        } else {
          // Hide raw DB errors from the user
          console.error('Signup error:', signupErr)
          setError('Erro ao criar conta. Verifique os dados e tente novamente.')
        }
        setLoading(false)
        return
      }

      const uid = data.user?.id
      if (!uid) {
        setError('Erro inesperado. Tente novamente em alguns segundos.')
        setLoading(false)
        return
      }

      // 2️⃣ Generate unique slug based on name
      let slug = slugify(name.trim())
      const { data: existing } = await supabase
        .from('profiles').select('slug').eq('slug', slug).neq('id', uid)
      if (existing && existing.length > 0) {
        slug = `${slug}-${Math.random().toString(36).slice(2,6)}`
      }

      // 3️⃣ Upsert profile — covers both: trigger created it (DO NOTHING) or trigger failed
      const { error: profileErr } = await supabase.from('profiles').upsert({
        id: uid,
        name: name.trim(),
        slug,
        profession: finalProf,
        plan: (plano === 'premium' ? 'premium' : 'basic') as 'basic'|'premium',
        plan_active: true,
        online: false,
        in_person: true,
        onboarding_done: false,
      }, { onConflict: 'id' })

      if (profileErr) {
        // Profile may already exist from trigger — that's fine, just log it
        console.warn('Profile upsert warning (may already exist):', profileErr.message)
      }

      // 4️⃣ Auto sign-in (if email confirmation is disabled)
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInData?.user) {
        router.push('/onboarding')
      } else {
        // Email confirmation required
        router.push('/confirmar-email?email=' + encodeURIComponent(email.trim()))
      }

    } catch (err: any) {
      console.error('Unexpected signup error:', err)
      setError('Erro inesperado. Verifique sua conexão e tente novamente.')
      setLoading(false)
    }
  }

  if (checking) return (
    <div style={{ minHeight:'100vh', background:T.off, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.fontSans }}>
      <GlobalStyles/>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:T.fontSerif, fontSize:22, color:T.dark, marginBottom:12 }}>Organiza<span style={{ color:T.sage }}>+</span></div>
        <div style={{ width:24, height:24, border:`3px solid ${T.sageP}`, borderTopColor:T.sage, borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto' }}/>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:T.fontSans, background:`radial-gradient(ellipse 80% 60% at 50% -10%, rgba(122,158,135,0.13) 0%, transparent 60%), ${T.off}`, opacity:mounted?1:0, transition:'opacity 0.4s' }}>
      <GlobalStyles/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:#8A9690}`}</style>
      <div style={{ width:'100%', maxWidth:460 }}>

        {/* Back */}
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:T.muted, textDecoration:'none', marginBottom:24 }}
          onMouseEnter={e=>e.currentTarget.style.color=T.dark} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
          ← Voltar ao início
        </Link>

        {/* Progress */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:12, color:T.muted, fontWeight:600 }}>
              {step===1 ? 'Dados de acesso' : 'Sua profissão'}
            </span>
            <span style={{ fontSize:12, color:T.sage, fontWeight:700 }}>Passo {step} de 2</span>
          </div>
          <div style={{ height:4, background:T.nude, borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', background:T.sage, width:step===1?'50%':'100%', borderRadius:4, transition:'width 0.4s ease' }}/>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:T.white, borderRadius:T.r24, padding:'36px', boxShadow:`0 8px 40px rgba(44,53,48,0.10), 0 0 0 1px rgba(237,232,224,0.5)` }}>
          {/* Logo + plan badge */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:T.sage }}/>
              <span style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark }}>Organiza<span style={{ color:T.sage }}>+</span></span>
            </div>
            <span style={{ background:T.sageG, color:T.sage, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:T.r100, border:`1px solid ${T.sageP}` }}>
              {plano==='premium'?'💎 Premium':'🌿 Basic'}
            </span>
          </div>

          <h1 style={{ fontFamily:T.fontSerif, fontSize:24, color:T.dark, margin:'0 0 4px' }}>
            {step===1 ? 'Crie sua conta' : 'Sua profissão'}
          </h1>
          <p style={{ fontSize:14, color:T.muted, margin:'0 0 24px' }}>
            {step===1 ? 'Preencha seus dados de acesso.' : 'Selecione ou informe sua área de atuação.'}
          </p>

          {/* Global error */}
          {error && (
            <div style={{ background:T.redL, border:`1px solid ${T.redB}`, color:T.red, fontSize:13, fontWeight:500, padding:'12px 14px', borderRadius:T.r12, marginBottom:18, display:'flex', gap:8 }}>
              <span style={{ fontWeight:700, flexShrink:0 }}>⚠</span> {error}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step===1 && (
            <form onSubmit={handleStep1} noValidate>
              <FI label="Nome completo" value={name} set={setName} placeholder="Ex: Dra. Ana Beatriz Silva" auto="name" error={nameErr}/>
              <FI label="E-mail" type="email" value={email} set={setEmail} placeholder="seu@email.com" auto="email" error={emailErr}/>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>Senha</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres" autoComplete="new-password"
                    style={{ width:'100%', padding:'12px 44px 12px 16px', fontSize:14, color:T.dark, background:T.off, border:`2px solid ${pwErr?T.red:T.nude}`, borderRadius:T.r12, outline:'none', fontFamily:T.fontSans, transition:'border-color 0.2s' }}
                    onFocus={e=>{ if(!pwErr) e.target.style.borderColor=T.sage }}
                    onBlur={e=>{ if(!pwErr) e.target.style.borderColor=T.nude }}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:T.muted, fontSize:18 }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {pwErr && <p style={{ fontSize:11, color:T.red, marginTop:5 }}>⚠ {pwErr}</p>}
                {!pwErr && <p style={{ fontSize:11, color:T.muted, marginTop:5 }}>Mínimo 6 caracteres</p>}
              </div>
              <Btn type="submit" variant="primary">Continuar →</Btn>
            </form>
          )}

          {/* ── STEP 2 ── */}
          {step===2 && (
            <form onSubmit={handleSubmit}>
              {/* Profession grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom: profession==='Outro' ? 12 : 18 }}>
                {PROFESSIONS.map(p => (
                  <button key={p} type="button" onClick={()=>{ setProfession(p); setProfErr(''); setCustomProf('') }}
                    style={{ padding:'10px 12px', borderRadius:T.r10, border:`2px solid ${profession===p?T.sage:T.nude}`, background:profession===p?T.sageG:T.off, color:profession===p?T.sage:T.mid, fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'left', fontFamily:T.fontSans, transition:'all 0.15s' }}>
                    {p}
                  </button>
                ))}
              </div>

              {/* Custom profession input */}
              {profession === 'Outro' && (
                <div style={{ marginBottom:18 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, color:T.dark, marginBottom:6 }}>
                    Qual é a sua profissão? *
                  </label>
                  <input value={customProf} onChange={e=>setCustomProf(e.target.value)}
                    placeholder="Ex: Biomédico, Advogado, Fonoaudiólogo..."
                    autoFocus
                    style={{ width:'100%', padding:'12px 16px', fontSize:14, color:T.dark, background:T.off, border:`2px solid ${T.sage}`, borderRadius:T.r12, outline:'none', fontFamily:T.fontSans }}/>
                </div>
              )}

              {profErr && (
                <div style={{ background:T.redL, border:`1px solid ${T.redB}`, color:T.red, fontSize:13, padding:'10px 12px', borderRadius:T.r10, marginBottom:14 }}>
                  ⚠ {profErr}
                </div>
              )}

              <div style={{ display:'flex', gap:10 }}>
                <button type="button" onClick={()=>{ setStep(1); setError(''); setProfErr('') }}
                  style={{ padding:'14px 20px', border:`2px solid ${T.nude}`, background:'transparent', color:T.dark, borderRadius:T.r12, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:T.fontSans, flexShrink:0, transition:'border-color 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=T.sage} onMouseLeave={e=>e.currentTarget.style.borderColor=T.nude}>
                  ←
                </button>
                <Btn type="submit" loading={loading} disabled={!profession || (profession==='Outro' && !customProf.trim())}>
                  {loading ? 'Criando conta...' : 'Criar minha conta →'}
                </Btn>
              </div>
            </form>
          )}

          {/* Login link */}
          <div style={{ textAlign:'center', marginTop:24, paddingTop:24, borderTop:`1px solid ${T.nude}` }}>
            <p style={{ fontSize:14, color:T.muted, margin:0 }}>
              Já tem conta?{' '}
              <Link href="/login" style={{ color:T.sage, fontWeight:700, textDecoration:'none' }}>Entrar</Link>
            </p>
          </div>
        </div>
        <p style={{ textAlign:'center', fontSize:12, color:T.muted, marginTop:16 }}>🔒 Conexão segura · Dados protegidos</p>
      </div>
    </div>
  )
}

export default function Cadastro() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#F7F5F0', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ fontFamily:'Georgia,serif', fontSize:20, color:'#2C3530' }}>Organiza<span style={{ color:'#7A9E87' }}>+</span></p>
      </div>
    }>
      <CadastroForm/>
    </Suspense>
  )
}
