'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Planos() {
  const [loading, setLoading]     = useState<string|null>(null)
  const [user, setUser]           = useState<{id:string,email:string}|null>(null)
  const [currentPlan, setCurrent] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUser({ id: user.id, email: user.email || '' })
      supabase.from('profiles').select('plan,plan_active').eq('id', user.id).single().then(({ data }) => {
        if (data) setCurrent(data.plan_active ? data.plan : '')
      })
    })
  }, [])

  async function subscribe(plan: string) {
    if (!user) { window.location.href = '/cadastro?plano='+plan; return }
    setLoading(plan)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, userId: user.id, email: user.email }),
    })
    const { url, error } = await res.json()
    if (url) window.location.href = url
    else { alert('Erro: ' + error); setLoading(null) }
  }

  return (
    <div className="min-h-screen bg-offwhite py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-dark mb-8 transition-colors">
          <ArrowLeft size={16}/> Voltar
        </Link>
        <div className="text-center mb-12">
          <div className="font-display text-3xl text-brand-dark mb-2">Organiza<span className="text-sage">+</span></div>
          <h1 className="font-display text-4xl text-brand-dark mb-3">Escolha seu plano</h1>
          <p className="text-brand-muted">Cancele quando quiser. Sem fidelidade.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* BASIC */}
          <div className={`bg-white rounded-3xl border-2 p-9 shadow-soft hover:-translate-y-1 transition-all ${currentPlan==='basic' ? 'border-sage' : 'border-nude'}`}>
            {currentPlan === 'basic' && <div className="bg-sage text-cream text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">✓ Plano atual</div>}
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">🌿 Basic</p>
            <div className="font-display text-5xl text-brand-dark">R$27</div>
            <p className="text-brand-muted text-sm mt-1 mb-6">por mês</p>
            <hr className="border-nude mb-6"/>
            <ul className="space-y-3 mb-8">
              {['Página profissional','Link personalizado','Agendamento online','Integração WhatsApp','Responsivo mobile'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-brand-mid font-medium">
                  <Check size={16} className="text-sage shrink-0"/>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => subscribe('basic')} disabled={loading==='basic' || currentPlan==='basic'}
              className="w-full border-2 border-nude text-brand-dark font-semibold py-3.5 rounded-xl hover:border-sage hover:text-sage hover:bg-sage-glow transition-all disabled:opacity-40">
              {loading==='basic' ? 'Redirecionando...' : currentPlan==='basic' ? 'Plano atual' : 'Assinar Basic'}
            </button>
          </div>

          {/* PREMIUM */}
          <div className={`rounded-3xl p-9 shadow-lg relative overflow-hidden hover:-translate-y-1 transition-all ${currentPlan==='premium' ? 'bg-brand-dark ring-2 ring-sage' : 'bg-brand-dark'}`} style={{outline: currentPlan==='premium' ? 'none' : '2px solid #7A9E87'}}>
            {currentPlan === 'premium' && <div className="absolute top-5 right-5 bg-sage text-cream text-[10px] font-bold px-3 py-1 rounded-full">✓ Plano atual</div>}
            {currentPlan !== 'premium' && <div className="absolute top-5 right-5 bg-sage text-cream text-[10px] font-bold px-3 py-1 rounded-full">Mais popular</div>}
            <p className="text-xs font-bold text-sage-light uppercase tracking-widest mb-3">💎 Premium</p>
            <div className="font-display text-5xl text-cream">R$47</div>
            <p className="text-white/40 text-sm mt-1 mb-6">por mês</p>
            <hr className="border-white/10 mb-6"/>
            <ul className="space-y-3 mb-8">
              {['Tudo do Basic','Painel administrativo completo','Gestão avançada de horários','Personalização da página','Upload de fotos','Controle total da agenda','Gestão de solicitações','Analytics completo','SEO básico incluso'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/70 font-medium">
                  <Check size={16} className="text-sage-light shrink-0"/>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => subscribe('premium')} disabled={loading==='premium' || currentPlan==='premium'}
              className="w-full bg-sage text-cream font-semibold py-3.5 rounded-xl hover:bg-sage-light transition-all disabled:opacity-40">
              {loading==='premium' ? 'Redirecionando...' : currentPlan==='premium' ? 'Plano atual' : 'Assinar Premium →'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-brand-muted mt-8">Pagamento seguro via Stripe 🔒 · Cartão de crédito ou débito</p>
      </div>
    </div>
  )
}
