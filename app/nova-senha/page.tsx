'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const C = { sage:'#7A9E87', dark:'#2C3530', muted:'#8A9690', cream:'#FAFAF7', off:'#F7F5F0', nude:'#EDE8E0', white:'#FFFFFF', red:'#ef4444', redL:'#fef2f2', redB:'#fecaca' }

export default function NovaSenha() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError('Erro ao atualizar senha. O link pode ter expirado.'); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:"'DM Sans', system-ui, sans-serif", background:`radial-gradient(ellipse 80% 60% at 50% -10%, rgba(122,158,135,0.12) 0%, transparent 60%), #F7F5F0`, opacity:mounted?1:0, transition:'opacity 0.4s' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap'); *{box-sizing:border-box;} input::placeholder{color:#8A9690;}`}</style>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ background:C.white, borderRadius:24, padding:'36px', boxShadow:'0 8px 40px rgba(44,53,48,0.10)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:C.sage, display:'inline-block' }}/>
            <span style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:20, color:C.dark }}>Organiza<span style={{ color:C.sage }}>+</span></span>
          </div>
          {done ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
              <h2 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:24, color:C.dark, margin:'0 0 8px' }}>Senha atualizada!</h2>
              <p style={{ fontSize:14, color:C.muted }}>Redirecionando para o painel...</p>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:24, color:C.dark, margin:'0 0 6px' }}>Nova senha</h1>
              <p style={{ fontSize:14, color:C.muted, margin:'0 0 24px' }}>Escolha uma senha segura para sua conta.</p>
              {error && <div style={{ background:C.redL, border:`1px solid ${C.redB}`, color:C.red, fontSize:13, padding:'11px 14px', borderRadius:10, marginBottom:16 }}>{error}</div>}
              <form onSubmit={handleSubmit}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>Nova senha</label>
                <div style={{ position:'relative', marginBottom:20 }}>
                  <input type={showPw?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                    style={{ width:'100%', padding:'12px 44px 12px 16px', fontSize:14, color:C.dark, background:C.off, border:`2px solid ${C.nude}`, borderRadius:12, outline:'none', fontFamily:'inherit' }}
                    onFocus={e=>e.target.style.borderColor=C.sage} onBlur={e=>e.target.style.borderColor=C.nude}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:C.muted }}>{showPw?'👁️':'🔒'}</button>
                </div>
                <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', fontSize:15, fontWeight:700, color:C.cream, background:C.dark, border:'none', borderRadius:12, cursor:'pointer', fontFamily:'inherit', transition:'background 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.sage} onMouseLeave={e=>e.currentTarget.style.background=C.dark}>
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
