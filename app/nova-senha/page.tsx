'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function NovaSenha() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError('Erro ao atualizar senha. O link pode ter expirado.'); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-md border border-nude/40 p-8 md:p-10">
          <div className="font-display text-2xl text-brand-dark mb-6">Organiza<span className="text-sage">+</span></div>
          {done ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-sage mx-auto mb-4"/>
              <h2 className="text-xl font-bold text-brand-dark mb-2">Senha atualizada!</h2>
              <p className="text-sm text-brand-muted">Redirecionando para o painel...</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-brand-dark mb-1">Nova senha</h1>
              <p className="text-sm text-brand-muted mb-8">Escolha uma nova senha segura para sua conta.</p>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">Nova senha</label>
                  <div className="relative">
                    <input type={show?'text':'password'} required minLength={6} value={password} onChange={e=>setPassword(e.target.value)}
                      className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite pr-12"
                      placeholder="Mínimo 6 caracteres"/>
                    <button type="button" onClick={()=>setShow(!show)} className="absolute right-4 top-3.5 text-brand-muted">
                      {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-brand-dark text-cream font-semibold py-3.5 rounded-xl hover:bg-sage transition-colors disabled:opacity-50">
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
