'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('E-mail ou senha incorretos.'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-dark mb-8 transition-colors">
          <ArrowLeft size={16}/> Voltar ao início
        </Link>
        <div className="bg-white rounded-3xl shadow-md border border-nude/40 p-8 md:p-10">
          <div className="font-display text-2xl text-brand-dark mb-1">
            Organiza<span className="text-sage">+</span>
          </div>
          <h1 className="text-xl font-bold text-brand-dark mt-4 mb-1">Bem-vindo de volta</h1>
          <p className="text-sm text-brand-muted mb-8">Entre na sua conta para acessar o painel.</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">E-mail</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm text-brand-dark outline-none focus:border-sage transition-colors bg-offwhite"
                placeholder="seu@email.com"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1.5">Senha</label>
              <div className="relative">
                <input type={show?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm text-brand-dark outline-none focus:border-sage transition-colors bg-offwhite pr-12"
                  placeholder="••••••••"/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-4 top-3.5 text-brand-muted hover:text-brand-dark">
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/recuperar-senha" className="text-xs text-sage hover:underline">Esqueci minha senha</Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-brand-dark text-cream font-semibold py-3.5 rounded-xl hover:bg-sage transition-colors disabled:opacity-50">
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-6">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-sage font-semibold hover:underline">Cadastre-se grátis</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
