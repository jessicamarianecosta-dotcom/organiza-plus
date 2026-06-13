'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react'
import { Suspense } from 'react'

const PROFESSIONS = ['Psicólogo(a)','Psiquiatra','Nutricionista','Fisioterapeuta','Médico(a)','Dentista','Esteticista','Terapeuta','Coach','Outro']

function CadastroForm() {
  const router = useRouter()
  const params = useSearchParams()
  const plano = params.get('plano') || 'basic'

  const [step, setStep] = useState(1)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', password: '', profession: '', whatsapp: '', city: '', state: '',
    bio: '', specialties: '', online: false, in_person: true,
  })

  function update(k: string, v: string | boolean) { setForm(f => ({...f,[k]:v})) }

  function slugify(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data: auth, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password })
      if (authErr) throw authErr
      const uid = auth.user?.id
      if (!uid) throw new Error('Erro ao criar usuário')

      let slug = slugify(form.name)
      const { data: existing } = await supabase.from('profiles').select('slug').eq('slug', slug)
      if (existing && existing.length > 0) slug = `${slug}-${Math.random().toString(36).slice(2,6)}`

      const { error: profileErr } = await supabase.from('profiles').insert({
        id: uid, name: form.name, slug, profession: form.profession,
        bio: form.bio || null, whatsapp: form.whatsapp || null,
        city: form.city || null, state: form.state || null,
        specialties: form.specialties ? form.specialties.split(',').map(s=>s.trim()).filter(Boolean) : [],
        online: form.online, in_person: form.in_person, plan: plano,
      })
      if (profileErr) throw profileErr
      router.push('/onboarding')
    } catch(err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-dark mb-8 transition-colors">
          <ArrowLeft size={16}/> Voltar
        </Link>

        {/* progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1,2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step>=s ? 'bg-sage text-white' : 'bg-nude text-brand-muted'}`}>
                {step>s ? <Check size={12}/> : s}
              </div>
              {s<2 && <div className={`h-0.5 w-16 rounded-full transition-all ${step>1 ? 'bg-sage' : 'bg-nude'}`}/>}
            </div>
          ))}
          <span className="ml-2 text-xs text-brand-muted">Passo {step} de 2</span>
        </div>

        <div className="bg-white rounded-3xl shadow-md border border-nude/40 p-8 md:p-10">
          <div className="font-display text-2xl text-brand-dark mb-1">Organiza<span className="text-sage">+</span></div>
          <h1 className="text-xl font-bold text-brand-dark mt-4 mb-1">
            {step===1 ? 'Crie sua conta' : 'Perfil profissional'}
          </h1>
          <p className="text-sm text-brand-muted mb-6">
            {step===1 ? 'Plano selecionado: ' : 'Personalize sua página pública.'}
            {step===1 && <span className="font-bold text-sage capitalize"> {plano === 'premium' ? '💎 Premium' : '🌿 Basic'}</span>}
          </p>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

          <form onSubmit={step===1 ? (e=>{e.preventDefault();setStep(2)}) : handleSubmit} className="space-y-4">
            {step===1 && <>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Nome completo</label>
                <input required value={form.name} onChange={e=>update('name',e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"
                  placeholder="Dra. Ana Beatriz"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">E-mail</label>
                <input type="email" required value={form.email} onChange={e=>update('email',e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"
                  placeholder="seu@email.com"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Senha</label>
                <div className="relative">
                  <input type={show?'text':'password'} required minLength={6} value={form.password} onChange={e=>update('password',e.target.value)}
                    className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite pr-12"
                    placeholder="Mínimo 6 caracteres"/>
                  <button type="button" onClick={()=>setShow(!show)} className="absolute right-4 top-3.5 text-brand-muted">
                    {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
            </>}

            {step===2 && <>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Profissão</label>
                <select required value={form.profession} onChange={e=>update('profession',e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite">
                  <option value="">Selecione...</option>
                  {PROFESSIONS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">WhatsApp</label>
                <input value={form.whatsapp} onChange={e=>update('whatsapp',e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"
                  placeholder="(11) 99999-9999"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">Cidade</label>
                  <input value={form.city} onChange={e=>update('city',e.target.value)}
                    className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite" placeholder="São Paulo"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1.5">Estado</label>
                  <input value={form.state} onChange={e=>update('state',e.target.value)} maxLength={2}
                    className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite" placeholder="SP"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Especialidades <span className="text-brand-muted font-normal">(separadas por vírgula)</span></label>
                <input value={form.specialties} onChange={e=>update('specialties',e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite"
                  placeholder="Ansiedade, Depressão, TCC"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1.5">Sobre você <span className="text-brand-muted font-normal">(bio)</span></label>
                <textarea rows={3} value={form.bio} onChange={e=>update('bio',e.target.value)}
                  className="w-full border-2 border-nude rounded-xl px-4 py-3 text-sm outline-none focus:border-sage bg-offwhite resize-none"
                  placeholder="Conte um pouco sobre você e seu trabalho..."/>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.online} onChange={e=>update('online',e.target.checked)} className="accent-sage w-4 h-4"/>
                  <span className="text-sm text-brand-dark">Atendimento online</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.in_person} onChange={e=>update('in_person',e.target.checked)} className="accent-sage w-4 h-4"/>
                  <span className="text-sm text-brand-dark">Presencial</span>
                </label>
              </div>
            </>}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-dark text-cream font-semibold py-3.5 rounded-xl hover:bg-sage transition-colors disabled:opacity-50 mt-2">
              {loading ? 'Criando conta...' : step===1 ? 'Continuar →' : 'Criar minha conta →'}
            </button>
          </form>

          {step===1 && (
            <p className="text-center text-sm text-brand-muted mt-6">
              Já tem conta? <Link href="/login" className="text-sage font-semibold hover:underline">Entrar</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Cadastro() {
  return <Suspense><CadastroForm/></Suspense>
}
