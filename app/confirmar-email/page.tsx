'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const C = { sage:'#7A9E87', sageG:'#EAF3EC', dark:'#2C3530', muted:'#8A9690', off:'#F7F5F0', nude:'#EDE8E0', white:'#fff' }

function ConfirmContent() {
  const params = useSearchParams()
  const router = useRouter()
  const email = params.get('email') || ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    // Check if user is already confirmed (they clicked the link)
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        router.push('/onboarding')
      }
    })
    return () => data.subscription.unsubscribe()
  }, [router])

  async function resend() {
    setResending(true)
    await supabase.auth.resend({ type: 'signup', email })
    setResending(false); setResent(true)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'DM Sans',system-ui,sans-serif", background:C.off }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap'); *{box-sizing:border-box}`}</style>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ background:C.white, borderRadius:24, padding:'40px', boxShadow:'0 8px 40px rgba(44,53,48,0.10)', textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:C.sageG, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, margin:'0 auto 20px' }}>📧</div>
          <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:26, color:C.dark, margin:'0 0 10px' }}>Confirme seu e-mail</h1>
          <p style={{ fontSize:14, color:C.muted, lineHeight:1.6, marginBottom:28 }}>
            Enviamos um link de confirmação para<br/>
            <strong style={{ color:C.dark }}>{email}</strong><br/>
            Clique no link para ativar sua conta.
          </p>
          <div style={{ background:C.sageG, border:`1px solid #D6E8DA`, borderRadius:12, padding:'14px', marginBottom:24, fontSize:13, color:C.sage, fontWeight:500 }}>
            💡 Após confirmar, você será redirecionado automaticamente para o onboarding.
          </div>
          {!resent ? (
            <button onClick={resend} disabled={resending}
              style={{ width:'100%', padding:'13px', fontSize:14, fontWeight:600, color:C.dark, background:'transparent', border:`2px solid ${C.nude}`, borderRadius:12, cursor:'pointer', fontFamily:'inherit', marginBottom:12 }}>
              {resending ? 'Reenviando...' : 'Reenviar e-mail'}
            </button>
          ) : (
            <p style={{ fontSize:13, color:C.sage, fontWeight:600, marginBottom:12 }}>✓ E-mail reenviado!</p>
          )}
          <Link href="/login" style={{ fontSize:13, color:C.muted, textDecoration:'none' }}>← Voltar ao login</Link>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmarEmail() {
  return <Suspense fallback={<div style={{ minHeight:'100vh', background:'#F7F5F0' }}/>}><ConfirmContent/></Suspense>
}
