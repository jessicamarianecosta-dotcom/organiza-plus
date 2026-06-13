'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    })
    if (error) { setError('Erro ao enviar e-mail. Tente novamente.'); setLoading(false); return }
    setDone(true); setLoading(false)
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-dark mb-8 transition-colors">
          <ArrowLeft size={16}/> Voltar ao login
        </Link>
        <div className="bg-white rounded-3xl shadow-md border border-nude/40 p-8 md:p-10">
          <div className="font-display text-2xl text-brand-dark mb-1">Organiza<span className="text-sage">+</span></div>
          {done ? (
            <div className="text-center py-6">
              <CheckCircle size={48} className="text-sage mx-auto mb-4"/>
              <h2 className="text-xl font-bold text-brand-dark mb-2">E-mail enviado!</h2>
              <p className="text-sm text-brand-muted mb-6">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
              <Link href="/login" className="text-sage font-semibold text-sm hover:underline">Voltar ao login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-brand-dark mt-4 mb-1">Recuperar senha</h1>
              <p className="text-sm text-brand-muted mb-8">Digite seu e-mail e enviaremos um link para redefinir sua senha.</p>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">E-mail</label>
                  <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                    className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"
                    placeholder="seu@email.com"/>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-brand-dark text-cream font-semibold py-3.5 rounded-xl hover:bg-sage transition-colors disabled:opacity-50">
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
