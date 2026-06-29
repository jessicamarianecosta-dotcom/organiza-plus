'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const C = { sage:'#7A9E87', sageG:'#EAF3EC', sageP:'#D6E8DA', dark:'#2C3530', mid:'#5A6660', muted:'#8A9690', cream:'#FAFAF7', off:'#F7F5F0', nude:'#EDE8E0', white:'#FFFFFF', red:'#ef4444', redL:'#fef2f2', redB:'#fecaca' }

async function redirectAfterAuth(userId: string, router: any) {
  // Check if profile exists and onboarding is done
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_done')
    .eq('id', userId)
    .single()

  if (!profile || !profile.onboarding_done) {
    router.push('/onboarding')
  } else {
    router.push('/dashboard')
  }
}

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser()
      .then(({ data: { user } }) => {
        if (user) {
          redirectAfterAuth(user.id, router)
        } else {
          setChecking(false)
        }
      })
      .catch(() => setChecking(false))
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.')
      } else if (error.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    if (data.user) {
      await redirectAfterAuth(data.user.id, router)
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F5F0', fontFamily:'system-ui' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:'Georgia,serif', fontSize:22, color:'#2C3530', marginBottom:12 }}>Organiza<span style={{ color:'#7A9E87' }}>+</span></div>
          <p style={{ fontSize:13, color:'#8A9690' }}>Verificando sessão...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:"'DM Sans',system-ui,sans-serif", background:`radial-gradient(ellipse 80% 60% at 50% -10%, rgba(122,158,135,0.13) 0%, transparent 60%), #F7F5F0`, opacity:mounted?1:0, transition:'opacity 0.4s' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap'); *{box-sizing:border-box} input::placeholder{color:#8A9690}`}</style>
      <div style={{ width:'100%', maxWidth:440 }}>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:C.muted, textDecoration:'none', marginBottom:28 }}
          onMouseEnter={e=>e.currentTarget.style.color=C.dark} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
          ← Voltar ao início
        </Link>
        <div style={{ background:C.white, borderRadius:24, padding:'40px', boxShadow:'0 8px 40px rgba(44,53,48,0.10), 0 0 0 1px rgba(237,232,224,0.5)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:C.sage, display:'inline-block' }}/>
            <span style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:20, color:C.dark }}>Organiza<span style={{ color:C.sage }}>+</span></span>
          </div>
          <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:26, color:C.dark, margin:'0 0 6px' }}>Bem-vindo de volta</h1>
          <p style={{ fontSize:14, color:C.muted, margin:'0 0 28px' }}>Entre na sua conta para acessar o painel.</p>

          {error && <div style={{ background:C.redL, border:`1px solid ${C.redB}`, color:C.red, fontSize:13, padding:'12px 14px', borderRadius:10, marginBottom:20 }}>{error}</div>}

          <form onSubmit={handleLogin}>
            <FocusInput label="E-mail" type="email" value={email} set={setEmail} placeholder="seu@email.com" auto="email"/>
            <div style={{ marginBottom:8 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>Senha</label>
              <div style={{ position:'relative' }}>
                <FocusInputRaw type={showPw?'text':'password'} value={password} set={setPassword} placeholder="••••••••" auto="current-password" pr={44}/>
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:16 }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div style={{ textAlign:'right', marginBottom:20 }}>
              <Link href="/recuperar-senha" style={{ fontSize:12, color:C.sage, fontWeight:500, textDecoration:'none' }}>Esqueci minha senha</Link>
            </div>
            <Btn loading={loading} disabled={!email||!password}>
              {loading ? 'Entrando...' : 'Entrar →'}
            </Btn>
          </form>

          <div style={{ textAlign:'center', marginTop:24, paddingTop:24, borderTop:`1px solid ${C.nude}` }}>
            <p style={{ fontSize:14, color:C.muted, margin:0 }}>
              Não tem conta?{' '}
              <Link href="/cadastro" style={{ color:C.sage, fontWeight:700, textDecoration:'none' }}>Cadastre-se grátis</Link>
            </p>
          </div>
        </div>
        <p style={{ textAlign:'center', fontSize:12, color:C.muted, marginTop:16 }}>🔒 Conexão segura · Dados protegidos</p>
      </div>
    </div>
  )
}

// Shared micro-components
function FocusInput({ label, type='text', value, set, placeholder, auto }: any) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#2C3530', marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} autoComplete={auto} required
        style={{ width:'100%', padding:'12px 16px', fontSize:14, color:'#2C3530', background:'#F7F5F0', border:`2px solid ${f?'#7A9E87':'#EDE8E0'}`, borderRadius:12, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
    </div>
  )
}
function FocusInputRaw({ type, value, set, placeholder, auto, pr=16 }: any) {
  const [f, setF] = useState(false)
  return (
    <input type={type} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} autoComplete={auto} required
      style={{ width:'100%', padding:`12px ${pr}px 12px 16px`, fontSize:14, color:'#2C3530', background:'#F7F5F0', border:`2px solid ${f?'#7A9E87':'#EDE8E0'}`, borderRadius:12, outline:'none', fontFamily:'inherit', transition:'border-color 0.2s' }}
      onFocus={()=>setF(true)} onBlur={()=>setF(false)}/>
  )
}
function Btn({ children, loading, disabled }: any) {
  const [h, setH] = useState(false)
  return (
    <button type="submit" disabled={disabled||loading}
      style={{ width:'100%', padding:'14px', fontSize:15, fontWeight:700, color:'#FAFAF7', background:h?'#7A9E87':'#2C3530', border:'none', borderRadius:12, cursor:disabled?'not-allowed':'pointer', fontFamily:'inherit', transition:'background 0.2s', opacity:disabled?0.5:1 }}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
      {children}
    </button>
  )
}
