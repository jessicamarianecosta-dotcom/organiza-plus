'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { T, GlobalStyles } from '@/lib/ds'
import { Check, ArrowLeft, Zap, Shield, Star } from 'lucide-react'

const BASIC_FEATURES = [
  'Página profissional pública',
  'Link personalizado único',
  'Agendamento online 24/7',
  'Integração WhatsApp automático',
  'Responsivo para celular',
  '1 profissional por conta',
]
const PREMIUM_FEATURES = [
  'Tudo do Basic',
  'Painel administrativo completo',
  'Gestão avançada de horários',
  '8 temas de cores personalizáveis',
  'Upload de foto profissional',
  'Analytics e métricas',
  'SEO básico configurado',
  'Suporte prioritário',
]

export default function Planos() {
  const router = useRouter()
  const [user, setUser] = useState<{id:string,email:string}|null>(null)
  const [currentPlan, setCurrent] = useState('')
  const [loading, setLoading] = useState<string|null>(null)
  const [mounted, setMounted] = useState(false)
  const [annual, setAnnual] = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUser({ id: user.id, email: user.email || '' })
      supabase.from('profiles').select('plan,plan_active').eq('id', user.id).single()
        .then(({ data }) => { if (data?.plan_active) setCurrent(data.plan) })
    })
  }, [])

  async function subscribe(plan: string) {
    if (!user) { router.push('/cadastro?plano='+plan); return }
    setLoading(plan)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, userId: user.id, email: user.email }),
    })
    const { url, error } = await res.json()
    if (url) { window.location.href = url } else { alert('Stripe não configurado ainda. ' + (error||'')); setLoading(null) }
  }

  const basicPrice  = annual ? 22 : 27
  const premiumPrice = annual ? 38 : 47

  if (!mounted) return <div style={{ minHeight:'100vh', background:T.off }}><GlobalStyles/></div>

  return (
    <div style={{ minHeight:'100vh', background:T.off, fontFamily:T.fontSans }}>
      <GlobalStyles/>

      {/* Header */}
      <div style={{ background:T.white, borderBottom:`1px solid ${T.nude}`, padding:'0 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', height:64, display:'flex', alignItems:'center', gap:16 }}>
          <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:T.muted, textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.color=T.dark} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
            <ArrowLeft size={15}/> Dashboard
          </Link>
          <span style={{ color:T.nude }}>|</span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:T.sage }}/>
            <span style={{ fontFamily:T.fontSerif, fontSize:18, color:T.dark }}>Organiza<span style={{ color:T.sage }}>+</span></span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'56px 24px 80px' }}>
        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:T.sageG, border:`1px solid ${T.sageP}`, borderRadius:T.r100, padding:'5px 14px', fontSize:12, fontWeight:700, color:T.sage, marginBottom:20 }}>
            <Zap size={12}/> Planos simples e transparentes
          </div>
          <h1 style={{ fontFamily:T.fontSerif, fontSize:'clamp(32px,5vw,52px)', color:T.dark, margin:'0 0 14px', lineHeight:1.1 }}>
            Escolha o plano <em style={{ color:T.sage, fontStyle:'italic' }}>ideal para você</em>
          </h1>
          <p style={{ fontSize:17, color:T.muted, maxWidth:480, margin:'0 auto 32px' }}>
            Sem surpresas, sem fidelidade. Cancele quando quiser.
          </p>

          {/* Annual toggle */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:14, background:T.white, border:`1px solid ${T.nude}`, borderRadius:T.r100, padding:'6px 8px 6px 16px', boxShadow:T.shadowSm }}>
            <span style={{ fontSize:13, fontWeight:600, color:annual?T.muted:T.dark }}>Mensal</span>
            <button type="button" onClick={()=>setAnnual(!annual)}
              style={{ width:44, height:24, borderRadius:T.r100, background:annual?T.sage:T.nude, border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
              <span style={{ position:'absolute', top:2, left:annual?22:2, width:20, height:20, borderRadius:'50%', background:T.white, boxShadow:'0 1px 4px rgba(0,0,0,0.15)', transition:'left 0.2s' }}/>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:13, fontWeight:600, color:annual?T.dark:T.muted }}>Anual</span>
              {annual && <span style={{ background:T.sageG, color:T.sage, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:T.r100, border:`1px solid ${T.sageP}` }}>-20%</span>}
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:24, marginBottom:56 }}>

          {/* BASIC */}
          <PlanCard
            name="🌿 Basic"
            price={basicPrice}
            period={annual?'mês (cobrado anualmente)':'mês'}
            desc="Para começar a receber agendamentos online."
            features={BASIC_FEATURES}
            cta={currentPlan==='basic'?'Plano atual':'Começar Basic'}
            featured={false}
            current={currentPlan==='basic'}
            loading={loading==='basic'}
            onSubscribe={()=>subscribe('basic')}
          />

          {/* PREMIUM */}
          <PlanCard
            name="💎 Premium"
            price={premiumPrice}
            period={annual?'mês (cobrado anualmente)':'mês'}
            desc="Para profissionais que querem crescer e automatizar tudo."
            features={PREMIUM_FEATURES}
            cta={currentPlan==='premium'?'Plano atual':'Começar Premium →'}
            featured={true}
            current={currentPlan==='premium'}
            loading={loading==='premium'}
            badge="Mais popular"
            onSubscribe={()=>subscribe('premium')}
          />
        </div>

        {/* Trust section */}
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:32, marginBottom:32 }}>
            {[
              { icon:<Shield size={16}/>, label:'Pagamento 100% seguro', sub:'via Stripe' },
              { icon:<Star size={16}/>, label:'+1.200 profissionais', sub:'já confiam' },
              { icon:<Zap size={16}/>, label:'Ativação imediata', sub:'após o pagamento' },
            ].map(item => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ color:T.sage }}>{item.icon}</div>
                <div>
                  <p style={{ fontWeight:700, fontSize:13, color:T.dark, margin:0 }}>{item.label}</p>
                  <p style={{ fontSize:11, color:T.muted, margin:0 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize:13, color:T.muted }}>
            Dúvidas?{' '}
            <a href="https://wa.me/5511999999999" style={{ color:T.sage, fontWeight:600, textDecoration:'none' }}>Fale conosco pelo WhatsApp</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function PlanCard({ name, price, period, desc, features, cta, featured, current, loading, badge, onSubscribe }: {
  name:string, price:number, period:string, desc:string, features:string[],
  cta:string, featured:boolean, current:boolean, loading:boolean, badge?:string, onSubscribe:()=>void
}) {
  const [h, setH] = useState(false)
  return (
    <div
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background: featured ? T.dark : T.white,
        borderRadius: T.r24,
        padding: '36px 32px',
        border: featured ? 'none' : `2px solid ${T.nude}`,
        outline: featured ? `2px solid ${T.sage}` : 'none',
        boxShadow: h ? T.shadowXl : featured ? T.shadowLg : T.shadowCard,
        position: 'relative', overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: h ? 'translateY(-4px)' : 'none',
      }}>
      {badge && (
        <div style={{ position:'absolute', top:18, right:18, background:T.sage, color:T.cream, fontSize:10, fontWeight:700, padding:'4px 12px', borderRadius:T.r100, letterSpacing:'0.04em' }}>
          {badge}
        </div>
      )}
      {current && (
        <div style={{ position:'absolute', top:18, right:18, background:T.sageG, color:T.sage, border:`1px solid ${T.sageP}`, fontSize:10, fontWeight:700, padding:'4px 12px', borderRadius:T.r100 }}>
          ✓ Plano atual
        </div>
      )}
      <p style={{ fontSize:12, fontWeight:700, color:featured?T.sageL:T.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>{name}</p>
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, marginBottom:6 }}>
        <span style={{ fontFamily:T.fontSerif, fontSize:54, color:featured?T.cream:T.dark, lineHeight:1 }}>R${price}</span>
        <span style={{ fontSize:13, color:featured?'rgba(255,255,255,0.4)':T.muted, marginBottom:8 }}>/{period}</span>
      </div>
      <p style={{ fontSize:14, color:featured?'rgba(255,255,255,0.5)':T.muted, marginBottom:28, lineHeight:1.5 }}>{desc}</p>
      <hr style={{ border:'none', borderTop:`1px solid ${featured?'rgba(255,255,255,0.09)':T.nude}`, marginBottom:26 }}/>
      <ul style={{ listStyle:'none', padding:0, margin:'0 0 30px', display:'flex', flexDirection:'column', gap:12 }}>
        {features.map(f => (
          <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:14, color:featured?'rgba(255,255,255,0.75)':T.mid, fontWeight:500 }}>
            <span style={{ width:20, height:20, borderRadius:'50%', background:featured?'rgba(168,196,173,0.18)':T.sageG, border:`1px solid ${featured?'rgba(168,196,173,0.3)':T.sageP}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
              <Check size={11} color={featured?T.sageL:T.sage} strokeWidth={3}/>
            </span>
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button" onClick={!current&&!loading?onSubscribe:undefined}
        disabled={current||loading}
        onMouseEnter={e=>{ if(!current&&!loading) e.currentTarget.style.opacity='0.88' }}
        onMouseLeave={e=>e.currentTarget.style.opacity='1'}
        style={{
          width:'100%', padding:'15px', fontSize:15, fontWeight:700,
          color: featured?T.cream:T.dark,
          background: featured?T.sage:(current?T.off:'transparent'),
          border: featured?'none':`2px solid ${current?T.nude:T.nude}`,
          borderRadius:T.r14, cursor:current||loading?'not-allowed':'pointer',
          fontFamily:T.fontSans, transition:'all 0.2s', opacity:current?0.5:1,
        }}>
        {loading ? '⏳ Redirecionando...' : cta}
      </button>
    </div>
  )
}
