'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const C = { sage:'#7A9E87', sageG:'#EAF3EC', sageP:'#D6E8DA', dark:'#2C3530', mid:'#5A6660', muted:'#8A9690', cream:'#FAFAF7', off:'#F7F5F0', nude:'#EDE8E0', white:'#FFFFFF', red:'#ef4444', redL:'#fef2f2', redB:'#fecaca' }

function Input({ label, type='text', value, onChange, placeholder, autoComplete }: any) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '12px 16px', fontSize: 14, color: C.dark,
          background: C.off, border: `2px solid ${focused ? C.sage : C.nude}`,
          borderRadius: 12, outline: 'none', transition: 'border-color 0.2s',
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos. Verifique e tente novamente.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: "'DM Sans', system-ui, sans-serif",
      background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(122,158,135,0.12) 0%, transparent 60%), ${C.off}`,
      opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap'); * { box-sizing: border-box; } input::placeholder { color: #8A9690; }`}</style>

      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Back link */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.muted, textDecoration: 'none', marginBottom: 28, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = C.dark}
          onMouseLeave={e => e.currentTarget.style.color = C.muted}>
          ← Voltar ao início
        </Link>

        {/* Card */}
        <div style={{
          background: C.white, borderRadius: 24, padding: '40px 40px 36px',
          boxShadow: '0 8px 40px rgba(44,53,48,0.10), 0 0 0 1px rgba(237,232,224,0.6)',
        }}>
          {/* Logo */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.sage, display: 'inline-block' }}/>
              <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: C.dark }}>
                Organiza<span style={{ color: C.sage }}>+</span>
              </span>
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 26, color: C.dark, margin: '0 0 6px' }}>Bem-vindo de volta</h1>
            <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Entre na sua conta para acessar o painel.</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: C.redL, border: `1px solid ${C.redB}`, color: C.red, fontSize: 13, padding: '11px 14px', borderRadius: 10, marginBottom: 18 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <Input label="E-mail" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email"/>
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ width: '100%', padding: '12px 44px 12px 16px', fontSize: 14, color: C.dark, background: C.off, border: `2px solid ${C.nude}`, borderRadius: 12, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = C.sage}
                  onBlur={e => e.target.style.borderColor = C.nude}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 18, padding: 2 }}>
                  {showPw ? '👁️' : '🔒'}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 8, marginBottom: 20 }}>
                <Link href="/recuperar-senha" style={{ fontSize: 12, color: C.sage, textDecoration: 'none', fontWeight: 500 }}>Esqueci minha senha</Link>
              </div>
            </div>

            <button type="submit" disabled={loading || !email || !password} style={{
              width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, color: C.cream,
              background: loading ? C.muted : C.dark, border: 'none', borderRadius: 12,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s, transform 0.15s',
              fontFamily: 'inherit',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.sage }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.dark }}>
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.nude}` }}>
            <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
              Não tem conta?{' '}
              <Link href="/cadastro" style={{ color: C.sage, fontWeight: 700, textDecoration: 'none' }}>Cadastre-se grátis</Link>
            </p>
          </div>
        </div>

        {/* Trust */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: 12, color: C.muted }}>🔒 Conexão segura · Dados protegidos</p>
        </div>
      </div>
    </div>
  )
}
