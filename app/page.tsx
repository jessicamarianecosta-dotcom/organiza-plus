'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Check, Star, ArrowRight, Globe, Bell, Shield, Clock, Users, BarChart2 } from 'lucide-react'

const STEPS = [
  { n:'01', icon:'✍️', title:'Crie sua conta', desc:'Cadastre-se em segundos, escolha sua profissão e preencha suas informações.' },
  { n:'02', icon:'🌐', title:'Página criada na hora', desc:'O sistema gera automaticamente sua página profissional com seu link único.' },
  { n:'03', icon:'📅', title:'Configure horários', desc:'Defina os dias e horários que você atende. Simples e visual.' },
  { n:'04', icon:'🔔', title:'Receba agendamentos', desc:'Clientes agendam e você é notificado no painel e no WhatsApp.' },
]

const FEATURES = [
  { icon:<BarChart2 size={20}/>, title:'Dashboard completo', desc:'Agendamentos, clientes e métricas em tempo real.' },
  { icon:<Clock size={20}/>, title:'Gestão de horários', desc:'Defina disponibilidade e bloqueie datas facilmente.' },
  { icon:<Globe size={20}/>, title:'Página automática', desc:'Gerada ao criar a conta — pronta para compartilhar.' },
  { icon:<Bell size={20}/>, title:'WhatsApp automático', desc:'Notificação instantânea com dados do cliente.' },
  { icon:<Users size={20}/>, title:'Gestão de clientes', desc:'Histórico completo de todos os pacientes.' },
  { icon:<Shield size={20}/>, title:'Seguro e multi-usuário', desc:'Cada conta é isolada e protegida.' },
]

const TESTIMONIALS = [
  { emoji:'🧠', name:'Dra. Camila R.', role:'Psicóloga — São Paulo', stars:5, text:'"Reduzi em 90% o tempo respondendo mensagens. Meus clientes adoram!"' },
  { emoji:'🥗', name:'Fernanda M.', role:'Nutricionista — Curitiba', stars:5, text:'"Finalmente tenho uma página profissional sem pagar caro por um site."' },
  { emoji:'💆', name:'Rafael S.', role:'Fisioterapeuta — BH', stars:5, text:'"Recebi o aviso no WhatsApp na hora. Nunca mais perdi uma consulta."' },
]

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen bg-cream">

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-10 py-3 md:py-4 flex items-center justify-between bg-cream/90 backdrop-blur-xl border-b border-nude/40 transition-shadow ${scrolled ? 'shadow-soft' : ''}`}>
        <div className="font-display text-lg md:text-xl text-brand-dark flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sage inline-block"/>
          Organiza<span className="text-sage">+</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#como-funciona" className="text-sm font-medium text-brand-mid hover:text-brand-dark transition-colors">Como funciona</a>
          <a href="#funcionalidades" className="text-sm font-medium text-brand-mid hover:text-brand-dark transition-colors">Funcionalidades</a>
          <a href="#planos" className="text-sm font-medium text-brand-mid hover:text-brand-dark transition-colors">Planos</a>
          <Link href="/login" className="text-sm font-medium text-brand-mid hover:text-brand-dark transition-colors">Entrar</Link>
          <Link href="/cadastro" className="bg-brand-dark text-cream text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-sage transition-colors">
            Começar agora →
          </Link>
        </div>
        {/* Mobile: Entrar + Começar */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/login" className="text-sm font-medium text-brand-mid px-3 py-2">Entrar</Link>
          <Link href="/cadastro" className="bg-brand-dark text-cream text-xs font-semibold px-3 py-2 rounded-xl">Começar</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 flex flex-col items-center text-center relative overflow-hidden"
        style={{background:'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(122,158,135,0.15) 0%, transparent 70%), #FAFAF7'}}>

        <div className="inline-flex items-center gap-2 bg-sage-glow border border-sage-pale rounded-full px-4 py-1.5 text-sage text-xs font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-sage"/>
          Agendamento profissional simplificado
        </div>

        <h1 className="font-display text-3xl md:text-6xl lg:text-7xl leading-tight text-brand-dark max-w-3xl mb-4 md:mb-6">
          Tenha sua página profissional e receba agendamentos{' '}
          <em className="text-sage not-italic">online</em> de forma simples.
        </h1>

        <p className="text-base md:text-xl text-brand-mid max-w-lg leading-relaxed mb-8 md:mb-10">
          Organize sua agenda, compartilhe sua página e permita que clientes agendem automaticamente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none sm:w-auto mb-8 md:mb-12">
          <Link href="/cadastro" className="bg-brand-dark text-cream font-semibold text-base px-8 py-4 rounded-xl hover:bg-sage transition-all shadow-md flex items-center justify-center gap-2">
            ✦ Começar agora grátis
          </Link>
          <a href="#como-funciona" className="border-2 border-nude text-brand-dark font-medium text-base px-8 py-4 rounded-xl hover:border-sage-light hover:bg-sage-glow transition-all flex items-center justify-center gap-2">
            Ver como funciona <ArrowRight size={16}/>
          </a>
        </div>

        <div className="flex items-center gap-3 text-sm text-brand-muted mb-10 md:mb-16">
          <div className="flex">
            {['🧠','🌿','🦷','💆'].map((e,i)=>(
              <div key={i} className="w-8 h-8 rounded-full border-2 border-cream bg-sage-pale flex items-center justify-center text-sm -ml-2 first:ml-0">{e}</div>
            ))}
          </div>
          <span>+1.200 profissionais já usam</span>
        </div>

        {/* DASHBOARD PREVIEW — clean, no nesting issues */}
        <div className="w-full max-w-3xl rounded-2xl shadow-lg border border-nude/40 overflow-hidden bg-white">
          {/* browser bar */}
          <div className="bg-offwhite px-4 py-2.5 flex items-center gap-3 border-b border-nude">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"/>
              <div className="w-3 h-3 rounded-full bg-yellow-400"/>
              <div className="w-3 h-3 rounded-full bg-sage-light"/>
            </div>
            <div className="flex-1 bg-nude rounded-md px-3 py-1.5 text-xs text-brand-muted flex items-center gap-1">
              🔒 organizamais.com/dashboard
            </div>
          </div>
          {/* dashboard body */}
          <div className="flex">
            {/* sidebar - hidden on small */}
            <div className="hidden sm:flex w-44 bg-brand-dark flex-col py-4 gap-1 shrink-0">
              <div className="font-display text-base text-cream px-4 pb-4 border-b border-white/10 mb-1">
                Organiza<span className="text-sage-light">+</span>
              </div>
              {['📊 Dashboard','📅 Agenda','👥 Clientes','🌐 Minha página','⚙️ Config.'].map((it,i)=>(
                <div key={it} className={`flex items-center gap-2 mx-2 px-2 py-2 rounded-lg text-xs font-medium ${i===0 ? 'bg-sage/20 text-sage-light' : 'text-white/30'}`}>{it}</div>
              ))}
            </div>
            {/* main content */}
            <div className="flex-1 bg-offwhite p-4 min-w-0">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-semibold text-sm text-brand-dark">Olá, Dra. Ana 👋</p>
                  <p className="text-xs text-brand-muted">Sexta-feira, 13 de junho</p>
                </div>
                <span className="bg-sage-glow text-sage text-xs font-bold px-2.5 py-1 rounded-full border border-sage-pale">✦ Premium</span>
              </div>
              {/* stat cards */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[['Hoje','8','↑ +3'],['Clientes','42','↑ +12'],['Pendentes','3','⏳']].map(([l,v,s])=>(
                  <div key={l} className="bg-white rounded-xl p-3 border border-nude/40 shadow-soft">
                    <p className="text-[9px] font-bold text-brand-muted uppercase tracking-wider">{l}</p>
                    <p className="text-xl font-bold text-brand-dark mt-0.5">{v}</p>
                    <p className="text-[10px] text-sage">{s}</p>
                  </div>
                ))}
              </div>
              {/* appointments */}
              <div className="bg-white rounded-xl border border-nude/40 overflow-hidden">
                <div className="px-3 py-2 border-b border-nude flex justify-between">
                  <span className="text-[10px] font-bold text-brand-dark">Próximos agendamentos</span>
                  <span className="text-[10px] font-bold text-sage bg-sage-glow px-2 py-0.5 rounded-full">Hoje</span>
                </div>
                {[['09:00','Mariana S.','Consulta inicial','confirmed'],['10:30','Carlos M.','Retorno','confirmed'],['14:00','Laura P.','Avaliação','pending']].map(([t,n,tp,s])=>(
                  <div key={n} className="flex items-center gap-2 px-3 py-2.5 border-b border-nude/20 last:border-0">
                    <div className="bg-sage-glow text-sage text-[10px] font-bold px-2 py-1 rounded-lg shrink-0">{t}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-brand-dark truncate">{n}</p>
                      <p className="text-[10px] text-brand-muted">{tp}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${s==='confirmed' ? 'bg-sage/10 text-sage' : 'bg-amber-50 text-amber-600'}`}>
                      {s==='confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFISSÕES ── */}
      <div className="py-8 md:py-10 px-4 text-center bg-white border-y border-nude/40">
        <p className="text-[10px] md:text-xs font-bold text-brand-muted uppercase tracking-widest mb-4">Para todos os profissionais de saúde e bem-estar</p>
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
          {['🧠 Psicólogo','💊 Psiquiatra','🥗 Nutricionista','🦷 Dentista','💆 Fisioterapeuta','⚕️ Médico','🌸 Esteticista','🧘 Terapeuta','🎯 Coach','✦ E mais'].map(p => (
            <span key={p} className="bg-offwhite border border-nude rounded-full px-3 py-1.5 text-xs md:text-sm text-brand-mid font-medium">{p}</span>
          ))}
        </div>
      </div>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-offwhite" id="como-funciona">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-sage-glow border border-sage-pale rounded-full px-4 py-1.5 text-sage text-xs font-semibold mb-4">✦ Como funciona</div>
          <h2 className="font-display text-3xl md:text-5xl text-brand-dark mb-3">Em minutos, sua página<br/>profissional está <em className="text-sage not-italic">no ar.</em></h2>
          <p className="text-base md:text-lg text-brand-mid mb-10 md:mb-14 max-w-lg">Sem precisar contratar designer ou desenvolver sites.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map(s => (
              <div key={s.n} className="bg-white rounded-2xl p-6 border border-nude/40 shadow-soft relative overflow-hidden">
                <div className="font-display text-4xl text-sage/10 absolute top-3 right-4 leading-none select-none">{s.n}</div>
                <div className="w-11 h-11 bg-sage-glow border border-sage-pale rounded-2xl flex items-center justify-center text-xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-brand-dark text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-brand-mid leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PÁGINA PÚBLICA ── */}
      <section className="py-16 md:py-24 px-4 md:px-6" style={{background:'linear-gradient(135deg, #EAF3EC 0%, #F4EFE8 100%)'}}>
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-sage-pale rounded-full px-4 py-1.5 text-sage text-xs font-semibold mb-4">🌐 Sua página profissional</div>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-5xl text-brand-dark mb-4">Uma página elegante que representa você com <em className="text-sage not-italic">sofisticação.</em></h2>
              <p className="text-base text-brand-mid mb-6 leading-relaxed">Cada profissional recebe uma página personalizada, responsiva e pronta para receber clientes.</p>
              <div className="flex flex-col gap-3">
                {[
                  {icon:'🔗', t:'Link personalizado', d:'organizamais.com/seu-nome'},
                  {icon:'📱', t:'100% responsiva', d:'Funciona em qualquer dispositivo.'},
                  {icon:'⚡', t:'Agendamento em 30 segundos', d:'Sem precisar ligar.'},
                  {icon:'💬', t:'Integração WhatsApp', d:'Notificação automática ao agendar.'},
                ].map(f => (
                  <div key={f.t} className="flex gap-3 bg-white rounded-2xl p-4 border border-white/60 shadow-soft">
                    <div className="w-10 h-10 bg-sage-glow rounded-xl flex items-center justify-center text-lg shrink-0">{f.icon}</div>
                    <div>
                      <p className="font-bold text-brand-dark text-sm mb-0.5">{f.t}</p>
                      <p className="text-xs text-brand-mid">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Profile card mockup */}
            <div className="bg-white rounded-3xl shadow-lg border border-nude/30 overflow-hidden">
              <div className="p-6 pb-5" style={{background:'linear-gradient(135deg, #2C3530 0%, #3d4f47 100%)'}}>
                <div className="w-16 h-16 rounded-full bg-sage-pale border-2 border-white/20 flex items-center justify-center text-3xl mb-3">👩‍⚕️</div>
                <h3 className="font-display text-xl text-cream">Dra. Ana Beatriz</h3>
                <p className="text-sage-light text-sm font-medium mt-0.5">Psicóloga Clínica — CRP 06/12345</p>
                <p className="text-white/40 text-xs mt-0.5">📍 São Paulo, SP · Online e presencial</p>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['Ansiedade','Depressão','TCC','Relacionamentos'].map(t=>(
                    <span key={t} className="bg-sage-glow border border-sage-pale text-sage text-xs font-semibold px-2.5 py-1 rounded-full">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-brand-mid leading-relaxed mb-4">Psicóloga especializada em TCC com 8 anos de experiência.</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['09:00','10:00','14:00','15:00'].map((t,i)=>(
                    <span key={t} className={`border rounded-lg px-3 py-2 text-xs font-semibold ${i===0 ? 'bg-sage text-white border-sage' : 'bg-offwhite border-nude text-brand-dark'}`}>{t}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-brand-dark text-cream py-3 rounded-xl text-xs font-semibold">Agendar consulta →</button>
                  <button className="bg-green-500 text-white px-3 py-3 rounded-xl text-sm">✉</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-brand-dark" id="funcionalidades">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-sage/15 border border-sage/20 rounded-full px-4 py-1.5 text-sage-light text-xs font-semibold mb-4">✦ Funcionalidades</div>
          <h2 className="font-display text-3xl md:text-5xl text-cream mb-10 md:mb-14 max-w-xl">Tudo que você precisa para <em className="text-sage-light not-italic">organizar e crescer.</em></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 hover:bg-sage/10 hover:border-sage/20 transition-all">
                <div className="text-sage-light mb-3">{f.icon}</div>
                <h3 className="font-bold text-cream text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-bege-pale" id="planos">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-nude rounded-full px-4 py-1.5 text-sage text-xs font-semibold mb-4">💰 Planos</div>
            <h2 className="font-display text-3xl md:text-5xl text-brand-dark mb-2">Simples e <em className="text-sage not-italic">acessível.</em></h2>
            <p className="text-brand-mid text-sm md:text-base">Sem surpresas. Cancele quando quiser.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl border-2 border-nude p-7 md:p-9 shadow-soft">
              <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">🌿 Basic</p>
              <div className="font-display text-5xl text-brand-dark">R$27</div>
              <p className="text-brand-muted text-sm mt-1 mb-5">por mês</p>
              <hr className="border-nude mb-5"/>
              <ul className="space-y-3 mb-7">
                {['Página profissional','Link personalizado','Agendamento online','Integração WhatsApp','Responsivo mobile'].map(f=>(
                  <li key={f} className="flex items-center gap-3 text-sm text-brand-mid font-medium">
                    <Check size={15} className="text-sage shrink-0"/>{f}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro?plano=basic" className="block w-full text-center border-2 border-nude text-brand-dark font-semibold py-3.5 rounded-xl hover:border-sage hover:text-sage hover:bg-sage-glow transition-all text-sm">
                Começar com Basic
              </Link>
            </div>
            <div className="bg-brand-dark rounded-3xl p-7 md:p-9 shadow-lg relative overflow-hidden" style={{outline:'2px solid #7A9E87'}}>
              <div className="absolute top-4 right-4 bg-sage text-cream text-[10px] font-bold px-2.5 py-1 rounded-full">Mais popular</div>
              <p className="text-xs font-bold text-sage-light uppercase tracking-widest mb-3">💎 Premium</p>
              <div className="font-display text-5xl text-cream">R$47</div>
              <p className="text-white/40 text-sm mt-1 mb-5">por mês</p>
              <hr className="border-white/10 mb-5"/>
              <ul className="space-y-3 mb-7">
                {['Tudo do Basic','Painel administrativo','Gestão de horários','Personalização + cores','Upload de fotos','Analytics completo','SEO básico incluso'].map(f=>(
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70 font-medium">
                    <Check size={15} className="text-sage-light shrink-0"/>{f}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro?plano=premium" className="block w-full text-center bg-sage text-cream font-semibold py-3.5 rounded-xl hover:bg-sage-light transition-all text-sm">
                Começar com Premium →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-cream">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-sage-glow border border-sage-pale rounded-full px-4 py-1.5 text-sage text-xs font-semibold mb-4">💬 Depoimentos</div>
          <h2 className="font-display text-3xl md:text-5xl text-brand-dark mb-10">Quem usa, <em className="text-sage not-italic">ama.</em></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-nude/40 shadow-soft">
                <div className="flex gap-0.5 mb-3">{Array(t.stars).fill(0).map((_,i)=><Star key={i} size={13} className="fill-yellow-400 text-yellow-400"/>)}</div>
                <p className="text-brand-mid leading-relaxed italic mb-5 text-sm">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sage-pale flex items-center justify-center text-base">{t.emoji}</div>
                  <div>
                    <p className="font-bold text-brand-dark text-sm">{t.name}</p>
                    <p className="text-xs text-brand-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-brand-dark text-center"
        style={{backgroundImage:'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(122,158,135,0.12) 0%, transparent 70%)'}}>
        <h2 className="font-display text-3xl md:text-5xl text-cream mb-4 max-w-xl mx-auto">
          Pronto para transformar sua <em className="text-sage-light not-italic">agenda?</em>
        </h2>
        <p className="text-base text-white/50 max-w-sm mx-auto mb-8">Crie sua conta agora. Sua página no ar em 5 minutos.</p>
        <Link href="/cadastro" className="inline-flex items-center gap-2 bg-sage text-cream font-semibold text-base px-8 py-4 rounded-xl hover:bg-sage-light transition-all shadow-md">
          ✦ Começar agora — é grátis <ArrowRight size={16}/>
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-brand-dark border-t border-white/[0.06] py-8 text-center px-4">
        <div className="font-display text-base text-white/20 mb-1">Organiza<span className="text-sage/40">+</span></div>
        <p className="text-xs text-white/20">© 2025 Organiza+. Feito com 💚 para profissionais modernos.</p>
      </footer>
    </div>
  )
}
