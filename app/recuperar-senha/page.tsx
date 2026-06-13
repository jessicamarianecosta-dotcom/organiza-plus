'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const C = { sage:'#7A9E87', sageG:'#EAF3EC', sageP:'#D6E8DA', dark:'#2C3530', mid:'#5A6660', muted:'#8A9690', cream:'#FAFAF7', off:'#F7F5F0', nude:'#EDE8E0', white:'#FFFFFF', red:'#ef4444', redL:'#fef2f2', redB:'#fecaca' }

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })
    if (error) { setError('Erro ao enviar e-mail. Verifique o endereço e tente novamente.'); setLoading(false); return }
    setDone(true); setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', fontFamily:"'DM Sans', system-ui, sans-serif", background:`radial-gradient(ellipse 80% 60% at 50% -10%, rgba(122,158,135,0.12) 0%, transparent 60%), #F7F5F0`, opacity:mounted?1:0, transition:'opacity 0.4s ease' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap'); *{box-sizing:border-box;} input::placeholder{color:#8A9690;}`}</style>
      <div style={{ width:'100%', maxWidth:420 }}>
        <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:C.muted, textDecoration:'none', marginBottom:24 }}>← Voltar ao login</Link>
        <div style={{ background:C.white, borderRadius:24, padding:'36px', boxShadow:'0 8px 40px rgba(44,53,48,0.10), 0 0 0 1px rgba(237,232,224,0.6)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:C.sage, display:'inline-block' }}/>
            <span style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:20, color:C.dark }}>Organiza<span style={{ color:C.sage }}>+</span></span>
          </div>
          {done ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:C.sageG, border:`2px solid ${C.sageP}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 20px' }}>✅</div>
              <h2 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:24, color:C.dark, margin:'0 0 10px' }}>E-mail enviado!</h2>
              <p style={{ fontSize:14, color:C.muted, marginBottom:24 }}>Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
              <Link href="/login" style={{ color:C.sage, fontWeight:700, fontSize:14, textDecoration:'none' }}>Voltar ao login →</Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:24, color:C.dark, margin:'0 0 6px' }}>Recuperar senha</h1>
              <p style={{ fontSize:14, color:C.muted, margin:'0 0 24px' }}>Digite seu e-mail e enviaremos um link para redefinir.</p>
              {error && <div style={{ background:C.redL, border:`1px solid ${C.redB}`, color:C.red, fontSize:13, padding:'11px 14px', borderRadius:10, marginBottom:16 }}>{error}</div>}
              <form onSubmit={handleSubmit}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>E-mail</label>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"
                  style={{ width:'100%', padding:'12px 16px', fontSize:14, color:C.dark, background:C.off, border:`2px solid ${focused?C.sage:C.nude}`, borderRadius:12, outline:'none', marginBottom:20, fontFamily:'inherit' }}
                  onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}/>
                <button type="submit" disabled={loading||!email} style={{ width:'100%', padding:'14px', fontSize:15, fontWeight:700, color:C.cream, background:C.dark, border:'none', borderRadius:12, cursor:'pointer', fontFamily:'inherit', transition:'background 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.sage} onMouseLeave={e=>e.currentTarget.style.background=C.dark}>
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
