'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Calendar, Check, Star, ArrowRight, Zap, Globe, Bell, Shield, Clock, Users } from 'lucide-react'

const PROFESSIONS = ['🧠 Psicólogo','💊 Psiquiatra','🥗 Nutricionista','🦷 Dentista','💆 Fisioterapeuta','⚕️ Médico','🌸 Esteticista','🧘 Terapeuta','🎯 Coach']

const STEPS = [
  { n:'01', icon:'✍️', title:'Crie sua conta', desc:'Cadastre-se em segundos, escolha sua profissão e preencha suas informações básicas.' },
  { n:'02', icon:'🌐', title:'Sua página é criada', desc:'O sistema gera automaticamente sua página em organizamais.com/seu-nome.' },
  { n:'03', icon:'📅', title:'Configure horários', desc:'Defina disponibilidade, bloqueie datas e gerencie sua agenda com total controle.' },
  { n:'04', icon:'🔔', title:'Receba agendamentos', desc:'Clientes agendam online e você é notificado no painel e pelo WhatsApp.' },
]

const FEATURES = [
  { icon: <Calendar size={22}/>, title:'Dashboard completo', desc:'Visualize agendamentos, clientes e métricas em um painel moderno.' },
  { icon: <Clock size={22}/>, title:'Gestão de horários', desc:'Defina disponibilidade, bloqueie datas e gerencie com total controle.' },
  { icon: <Globe size={22}/>, title:'Página automática', desc:'Gerada ao criar a conta — elegante, rápida e pronta para uso.' },
  { icon: <Bell size={22}/>, title:'Notificação WhatsApp', desc:'Receba os dados do agendamento direto no seu WhatsApp.' },
  { icon: <Users size={22}/>, title:'Gestão de clientes', desc:'Histórico completo de todos os pacientes e agendamentos.' },
  { icon: <Shield size={22}/>, title:'Multi-usuário seguro', desc:'Cada profissional tem conta isolada e dados protegidos.' },
]

const TESTIMONIALS = [
  { emoji:'🧠', name:'Dra. Camila R.', role:'Psicóloga — São Paulo', stars:5, text:'"Reduzi em 90% o tempo respondendo mensagens sobre agendamento. Meus clientes adoram a praticidade."' },
  { emoji:'🥗', name:'Fernanda M.', role:'Nutricionista — Curitiba', stars:5, text:'"Finalmente tenho uma página profissional sem pagar caro por um site. O visual é incrível!"' },
  { emoji:'💆', name:'Rafael S.', role:'Fisioterapeuta — BH', stars:5, text:'"Recebi o aviso no WhatsApp na hora. Nunca mais perdi uma consulta por falta de comunicação."' },
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
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between bg-cream/85 backdrop-blur-xl border-b border-nude/40 transition-shadow ${scrolled ? 'shadow-soft' : ''}`}>
        <div className="font-display text-xl text-brand-dark flex items-center gap-2">
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
        <Link href="/cadastro" className="md:hidden bg-brand-dark text-cream text-sm font-semibold px-4 py-2 rounded-xl">Começar</Link>
      </nav>

      {/* HERO */}
      <section className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center text-center relative overflow-hidden"
        style={{background:'radial-gradient(ellipse 70% 55% at 50% -5%, rgba(122,158,135,0.18) 0%, transparent 70%), #FAFAF7'}}>
        <div className="inline-flex items-center gap-2 bg-sage-glow border border-sage-pale rounded-full px-4 py-1.5 text-sage text-xs font-semibold mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-sage"/>
          Agendamento profissional simplificado
        </div>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight text-brand-dark max-w-3xl mb-6">
          Tenha sua página profissional e receba agendamentos{' '}
          <em className="text-sage not-italic">online</em> de forma simples.
        </h1>
        <p className="text-lg md:text-xl text-brand-mid max-w-xl leading-relaxed mb-10">
          Organize sua agenda, compartilhe sua página e permita que clientes agendem horários automaticamente — sem complicação.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/cadastro" className="bg-brand-dark text-cream font-semibold text-base px-8 py-4 rounded-xl hover:bg-sage transition-all hover:-translate-y-0.5 shadow-md flex items-center gap-2">
            ✦ Começar agora grátis
          </Link>
          <a href="#como-funciona" className="border-2 border-nude text-brand-dark font-medium text-base px-8 py-4 rounded-xl hover:border-sage-light hover:bg-sage-glow transition-all flex items-center gap-2">
            Ver como funciona <ArrowRight size={16}/>
          </a>
        </div>
        <div className="flex items-center gap-3 text-sm text-brand-muted">
          <div className="flex">
            {['🧠','🌿','🦷','💆'].map((e,i)=>(
              <div key={i} className="w-8 h-8 rounded-full border-2 border-cream bg-sage-pale flex items-center justify-center text-sm -ml-2 first:ml-0">{e}</div>
            ))}
          </div>
          <span>+1.200 profissionais já usam o Organiza+</span>
        </div>

        {/* DASHBOARD PREVIEW */}
        <div className="mt-16 w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg border border-nude/40 overflow-hidden">
            {/* browser bar */}
            <div className="bg-offwhite px-5 py-3 flex items-center gap-3 border-b border-nude">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"/>
                <div className="w-3 h-3 rounded-full bg-yellow-400"/>
                <div className="w-3 h-3 rounded-full bg-sage-light"/>
              </div>
              <div className="flex-1 bg-nude rounded-md px-3 py-1.5 text-xs text-brand-muted flex items-center gap-1">
                🔒 organizamais.com/dashboard
              </div>
            </div>
            {/* dashboard */}
            <div className="flex min-h-[360px]">
              {/* sidebar */}
              <div className="hidden md:flex w-52 bg-brand-dark flex-col py-6 gap-1">
                <div className="font-display text-lg text-cream px-5 pb-5 border-b border-white/10 mb-2">
                  Organiza<span className="text-sage-light">+</span>
                </div>
                {[['📊','Dashboard',true],['📅','Agenda',false],['👥','Clientes',false],['🌐','Minha página',false],['⚙️','Config.',false]].map(([ic,lb,ac])=>(
                  <div key={lb as string} className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-sm font-medium ${ac ? 'bg-sage/20 text-sage-light' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                    <span>{ic}</span>{lb}
                  </div>
                ))}
              </div>
              {/* main */}
              <div className="flex-1 bg-offwhite p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="font-semibold text-brand-dark">Olá, Dra. Ana 👋</p>
                    <p className="text-xs text-brand-muted">Sexta-feira, 13 de junho de 2025</p>
                  </div>
                  <span className="bg-sage-glow text-sage text-xs font-bold px-3 py-1 rounded-full">✦ Premium</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[['Agendamentos hoje','8','↑ +3 vs ontem'],['Clientes este mês','42','↑ +12 novos'],['Pendentes','3','⏳ Aprovar']].map(([l,v,c])=>(
                    <div key={l as string} className="bg-white rounded-xl p-4 border border-nude/40">
                      <p className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider">{l}</p>
                      <p className="text-2xl font-bold text-brand-dark mt-1">{v}</p>
                      <p className="text-xs text-sage mt-0.5">{c}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-nude/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-nude flex justify-between items-center">
                    <span className="text-xs font-bold text-brand-dark">Próximos agendamentos</span>
                    <span className="bg-sage-glow text-sage text-[10px] font-bold px-2 py-0.5 rounded-full">Hoje</span>
                  </div>
                  {[['09:00','Mariana S.','Consulta inicial','confirmed'],['10:30','Carlos M.','Retorno','confirmed'],['14:00','Laura P.','Avaliação','pending']].map(([t,n,tp,s])=>(
                    <div key={n as string} className="flex items-center gap-3 px-4 py-3 border-b border-nude/30 last:border-0">
                      <div className="bg-sage-glow text-sage text-xs font-bold px-2.5 py-1.5 rounded-lg min-w-[48px] text-center">{t}</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-brand-dark">{n}</p>
                        <p className="text-xs text-brand-muted">{tp}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${s==='confirmed' ? 'bg-sage/10 text-sage' : 'bg-bege/20 text-bege'}`}>
                        {s==='confirmed' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESSIONS */}
      <div className="py-10 px-6 text-center bg-white border-y border-nude/40">
        <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-5">Para todos os profissionais de saúde e bem-estar</p>
        <div className="flex flex-wrap gap-2.5 justify-center max-w-2xl mx-auto">
          {PROFESSIONS.map(p => (
            <span key={p} className="bg-offwhite border border-nude rounded-full px-4 py-2 text-sm text-brand-mid font-medium hover:border-sage-light hover:text-sage hover:bg-sage-glow transition-all cursor-default">{p}</span>
          ))}
          <span className="bg-offwhite border border-nude rounded-full px-4 py-2 text-sm text-brand-mid font-medium">✦ E muito mais</span>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-offwhite" id="como-funciona">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-sage-glow border border-sage-pale rounded-full px-4 py-1.5 text-sage text-xs font-semibold mb-4">✦ Como funciona</div>
          <h2 className="font-display text-4xl md:text-5xl text-brand-dark mb-3">Em minutos, sua página<br/>profissional está <em className="text-sage not-italic">no ar.</em></h2>
          <p className="text-lg text-brand-mid mb-14 max-w-lg">Sem precisar contratar designer ou desenvolver sites. O Organiza+ faz tudo por você.</p>
          <div className="grid md:grid-cols-4 gap-5">
            {STEPS.map(s => (
              <div key={s.n} className="bg-white rounded-2xl p-7 border border-nude/40 shadow-soft relative overflow-hidden hover:-translate-y-1 transition-transform">
                <div className="font-display text-5xl text-sage/10 absolute top-3 right-4 leading-none select-none">{s.n}</div>
                <div className="w-12 h-12 bg-sage-glow border border-sage-pale rounded-2xl flex items-center justify-center text-2xl mb-5">{s.icon}</div>
                <h3 className="font-bold text-brand-dark mb-2">{s.title}</h3>
                <p className="text-sm text-brand-mid leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PUBLIC PAGE PREVIEW */}
      <section className="py-24 px-6" style={{background:'linear-gradient(135deg, #EAF3EC 0%, #F4EFE8 100%)'}}>
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-sage-pale rounded-full px-4 py-1.5 text-sage text-xs font-semibold mb-4">🌐 Sua página profissional</div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl text-brand-dark mb-4">Uma página elegante que representa você com <em className="text-sage not-italic">sofisticação.</em></h2>
              <p className="text-lg text-brand-mid mb-8 leading-relaxed">Cada profissional recebe uma página personalizada, responsiva e pronta para receber clientes.</p>
              <div className="flex flex-col gap-4">
                {[
                  {icon:'🔗', t:'Link personalizado', d:'organizamais.com/seu-nome — compartilhe nas redes sociais e bio do Instagram.'},
                  {icon:'📱', t:'100% responsiva', d:'Funciona perfeitamente em celular, tablet ou computador.'},
                  {icon:'⚡', t:'Agendamento instantâneo', d:'O cliente agenda em menos de 30 segundos, sem precisar ligar.'},
                  {icon:'💬', t:'Integração WhatsApp', d:'Você recebe notificação imediata com todos os dados do cliente.'},
                ].map(f => (
                  <div key={f.t} className="flex gap-4 bg-white rounded-2xl p-5 border border-white/60 shadow-soft hover:translate-x-1 transition-transform">
                    <div className="w-11 h-11 bg-sage-glow rounded-xl flex items-center justify-center text-xl shrink-0">{f.icon}</div>
                    <div>
                      <p className="font-bold text-brand-dark text-sm mb-1">{f.t}</p>
                      <p className="text-xs text-brand-mid leading-relaxed">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* PROFILE CARD MOCKUP */}
            <div className="bg-white rounded-3xl shadow-lg border border-nude/30 overflow-hidden">
              <div className="p-8 pb-6" style={{background:'linear-gradient(135deg, #2C3530 0%, #3d4f47 100%)'}}>
                <div className="w-20 h-20 rounded-full bg-sage-pale border-2 border-white/20 flex items-center justify-center text-4xl mb-4">👩‍⚕️</div>
                <h3 className="font-display text-2xl text-cream">Dra. Ana Beatriz</h3>
                <p className="text-sage-light text-sm font-medium mt-1">Psicóloga Clínica — CRP 06/12345</p>
                <p className="text-white/40 text-xs mt-1">📍 São Paulo, SP · Online e presencial</p>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Ansiedade','Depressão','TCC','Relacionamentos'].map(t=>(
                    <span key={t} className="bg-sage-glow border border-sage-pale text-sage text-xs font-semibold px-3 py-1 rounded-full">{t}</span>
                  ))}
                </div>
                <p className="text-sm text-brand-mid leading-relaxed mb-5">Psicóloga especializada em TCC com 8 anos de experiência. Atendo adultos e adolescentes com foco em ansiedade e autoconhecimento.</p>
                <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">Horários disponíveis — Terça</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {['09:00','10:00','14:00','15:00'].map((t,i)=>(
                    <span key={t} className={`border rounded-lg px-3 py-2 text-sm font-semibold cursor-pointer transition-all ${i===0 ? 'bg-sage text-white border-sage' : 'bg-offwhite border-nude text-brand-dark hover:border-sage hover:bg-sage-glow'}`}>{t}</span>
                  ))}
                  <span className="border border-nude rounded-lg px-3 py-2 text-sm font-semibold text-brand-muted/40 cursor-not-allowed">16:00 ✗</span>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-brand-dark text-cream py-3.5 rounded-xl text-sm font-semibold hover:bg-sage transition-colors">Agendar consulta →</button>
                  <button className="bg-green-500 text-white px-4 py-3.5 rounded-xl text-lg hover:bg-green-600 transition-colors">✉</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-brand-dark" id="funcionalidades">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-sage/15 border border-sage/20 rounded-full px-4 py-1.5 text-sage-light text-xs font-semibold mb-4">✦ Funcionalidades</div>
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-14 max-w-xl">Tudo que você precisa para <em className="text-sage-light not-italic">organizar e crescer</em> sua agenda.</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-7 hover:bg-sage/10 hover:border-sage/20 hover:-translate-y-1 transition-all">
                <div className="text-sage-light mb-4">{f.icon}</div>
                <h3 className="font-bold text-cream mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 px-6 bg-bege-pale" id="planos">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white border border-nude rounded-full px-4 py-1.5 text-sage text-xs font-semibold mb-4">💰 Planos</div>
            <h2 className="font-display text-4xl md:text-5xl text-brand-dark mb-3">Simples, transparente e <em className="text-sage not-italic">acessível.</em></h2>
            <p className="text-lg text-brand-mid">Sem surpresas. Cancele quando quiser. Comece em minutos.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* BASIC */}
            <div className="bg-white rounded-3xl border-2 border-nude p-9 shadow-soft hover:-translate-y-1 transition-transform">
              <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-3">🌿 Basic</p>
              <div className="font-display text-5xl text-brand-dark">R$27</div>
              <p className="text-brand-muted text-sm mt-1 mb-6">por mês</p>
              <hr className="border-nude mb-6"/>
              <ul className="space-y-3 mb-8">
                {['Página profissional','Link personalizado','Agendamento online','Integração WhatsApp','Responsivo mobile'].map(f=>(
                  <li key={f} className="flex items-center gap-3 text-sm text-brand-mid font-medium">
                    <Check size={16} className="text-sage shrink-0"/>{f}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro?plano=basic" className="block w-full text-center border-2 border-nude text-brand-dark font-semibold py-3.5 rounded-xl hover:border-sage hover:text-sage hover:bg-sage-glow transition-all">
                Começar com Basic
              </Link>
            </div>
            {/* PREMIUM */}
            <div className="bg-brand-dark rounded-3xl p-9 shadow-lg relative overflow-hidden hover:-translate-y-1 transition-transform" style={{outline:'2px solid #7A9E87'}}>
              <div className="absolute top-5 right-5 bg-sage text-cream text-[10px] font-bold px-3 py-1 rounded-full">Mais popular</div>
              <p className="text-xs font-bold text-sage-light uppercase tracking-widest mb-3">💎 Premium</p>
              <div className="font-display text-5xl text-cream">R$47</div>
              <p className="text-white/40 text-sm mt-1 mb-6">por mês</p>
              <hr className="border-white/10 mb-6"/>
              <ul className="space-y-3 mb-8">
                {['Tudo do Basic','Painel administrativo completo','Gestão avançada de horários','Personalização da página','Upload de fotos','Controle total da agenda','Gestão de solicitações','SEO básico incluso'].map(f=>(
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70 font-medium">
                    <Check size={16} className="text-sage-light shrink-0"/>{f}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro?plano=premium" className="block w-full text-center bg-sage text-cream font-semibold py-3.5 rounded-xl hover:bg-sage-light transition-all">
                Começar com Premium →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-cream">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-sage-glow border border-sage-pale rounded-full px-4 py-1.5 text-sage text-xs font-semibold mb-4">💬 Depoimentos</div>
          <h2 className="font-display text-4xl md:text-5xl text-brand-dark mb-12">Quem usa, <em className="text-sage not-italic">ama.</em></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-7 border border-nude/40 shadow-soft hover:-translate-y-1 transition-transform">
                <div className="flex gap-0.5 mb-4">{Array(t.stars).fill(0).map((_,i)=><Star key={i} size={14} className="fill-yellow-400 text-yellow-400"/>)}</div>
                <p className="text-brand-mid leading-relaxed italic mb-5 text-sm">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sage-pale flex items-center justify-center text-lg">{t.emoji}</div>
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

      {/* FINAL CTA */}
      <section className="py-28 px-6 bg-brand-dark text-center" style={{backgroundImage:'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(122,158,135,0.12) 0%, transparent 70%)'}}>
        <h2 className="font-display text-4xl md:text-5xl text-cream mb-4 max-w-xl mx-auto">
          Pronto para transformar sua <em className="text-sage-light not-italic">agenda profissional?</em>
        </h2>
        <p className="text-lg text-white/50 max-w-md mx-auto mb-10">Crie sua conta agora e tenha sua página profissional no ar em menos de 5 minutos.</p>
        <Link href="/cadastro" className="inline-flex items-center gap-2 bg-sage text-cream font-semibold text-lg px-10 py-5 rounded-xl hover:bg-sage-light transition-all hover:-translate-y-0.5 shadow-md">
          ✦ Começar agora — é grátis <ArrowRight size={18}/>
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-dark border-t border-white/[0.06] py-10 text-center">
        <div className="font-display text-lg text-white/20 mb-2">Organiza<span className="text-sage/40">+</span></div>
        <p className="text-xs text-white/20">© 2025 Organiza+. Feito com 💚 para profissionais modernos.</p>
      </footer>
    </div>
  )
}
