'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ArrowRight, Check, Menu, X, Star, Zap, Globe, Bell, Shield, Clock, Users, BarChart2 } from 'lucide-react'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const navStyle = {
    position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 40px', height: 64,
    background: scrolled ? 'rgba(250,250,247,0.95)' : 'rgba(250,250,247,0.7)',
    backdropFilter: 'blur(20px)',
    borderBottom: scrolled ? '1px solid #EDE8E0' : '1px solid transparent',
    boxShadow: scrolled ? '0 4px 24px rgba(44,53,48,0.06)' : 'none',
    transition: 'all 0.3s ease',
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#FAFAF7', color: '#2C3530', overflowX: 'hidden', WebkitFontSmoothing: 'antialiased' }}>

      {/* ─── NAV ─── */}
      <nav style={navStyle}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7A9E87', display: 'inline-block' }}/>
          <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: '#2C3530' }}>
            Organiza<span style={{ color: '#7A9E87' }}>+</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden md:flex">
          {[['#como-funciona','Como funciona'],['#funcionalidades','Funcionalidades'],['#planos','Planos']].map(([h,l])=>(
            <a key={h} href={h} style={{ fontSize: 14, fontWeight: 500, color: '#5A6660', textDecoration: 'none' }}
              onMouseEnter={e=>(e.target as HTMLElement).style.color='#2C3530'}
              onMouseLeave={e=>(e.target as HTMLElement).style.color='#5A6660'}>{l}</a>
          ))}
          <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: '#5A6660', textDecoration: 'none' }}>Entrar</Link>
          <Link href="/cadastro" style={{ background: '#2C3530', color: '#FAFAF7', padding: '10px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='#7A9E87'}
            onMouseLeave={e=>e.currentTarget.style.background='#2C3530'}>
            Começar agora →
          </Link>
        </div>

        {/* Mobile nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="flex md:hidden">
          <Link href="/login" style={{ fontSize: 13, fontWeight: 600, color: '#5A6660', textDecoration: 'none' }}>Entrar</Link>
          <Link href="/cadastro" style={{ background: '#2C3530', color: '#FAFAF7', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Começar
          </Link>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#2C3530', display: 'flex' }}>
            {menuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99, background: '#FAFAF7', borderBottom: '1px solid #EDE8E0', padding: '8px 24px 16px' }}>
          {[['#como-funciona','Como funciona'],['#funcionalidades','Funcionalidades'],['#planos','Planos']].map(([h,l])=>(
            <a key={h} href={h} onClick={()=>setMenuOpen(false)}
              style={{ display: 'block', padding: '13px 0', fontSize: 15, fontWeight: 500, color: '#2C3530', textDecoration: 'none', borderBottom: '1px solid #EDE8E0' }}>{l}</a>
          ))}
        </div>
      )}

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '130px 24px 80px',
        background: 'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(122,158,135,0.15) 0%, transparent 65%), #FAFAF7',
        opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease',
      }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EAF3EC', border: '1px solid #D6E8DA', borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 600, color: '#7A9E87', marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7A9E87', display: 'inline-block' }}/>
          Agendamento profissional simplificado
        </div>

        {/* H1 */}
        <h1 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 'clamp(38px,6vw,76px)', lineHeight: 1.06,
          letterSpacing: '-0.025em', color: '#2C3530',
          maxWidth: 820, marginBottom: 24,
        }}>
          Tenha sua página profissional e receba agendamentos{' '}
          <em style={{ color: '#7A9E87', fontStyle: 'italic' }}>online</em> automaticamente.
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: '#5A6660', maxWidth: 540, lineHeight: 1.7, marginBottom: 44 }}>
          Organize sua agenda, compartilhe seu link e permita que clientes agendem horários em segundos — sem complicação.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
          <Link href="/cadastro" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#2C3530', color: '#FAFAF7', padding: '16px 38px',
            borderRadius: 14, fontSize: 16, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 8px 32px rgba(44,53,48,0.18)', transition: 'all 0.2s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='#7A9E87';e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='#2C3530';e.currentTarget.style.transform='translateY(0)'}}>
            ✦ Começar agora grátis
          </Link>
          <a href="#como-funciona" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', color: '#2C3530', padding: '16px 30px',
            borderRadius: 14, fontSize: 16, fontWeight: 600, textDecoration: 'none',
            border: '2px solid #EDE8E0', transition: 'all 0.2s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#A8C4AD';e.currentTarget.style.background='#EAF3EC';e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#EDE8E0';e.currentTarget.style.background='transparent';e.currentTarget.style.transform='translateY(0)'}}>
            Ver como funciona <ArrowRight size={17}/>
          </a>
        </div>

        {/* Trust */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#8A9690', marginBottom: 72 }}>
          <div style={{ display: 'flex' }}>
            {['🧠','🌿','🦷','💆'].map((e,i)=>(
              <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #FAFAF7', background: '#D6E8DA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, marginLeft: i===0?0:-10 }}>{e}</div>
            ))}
          </div>
          <span>+1.200 profissionais já usam o Organiza+</span>
        </div>

        {/* ─── MOCKUP ─── */}
        <div style={{ width: '100%', maxWidth: 940, position: 'relative' }}>
          {/* Floating card left */}
          <div className="hidden md:flex" style={{ position: 'absolute', left: -30, bottom: 80, background: '#fff', borderRadius: 16, padding: '13px 18px', boxShadow: '0 12px 40px rgba(44,53,48,0.12)', border: '1px solid #EDE8E0', alignItems: 'center', gap: 12, zIndex: 2, animation: 'float1 3.5s ease-in-out infinite' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EAF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📅</div>
            <div>
              <div style={{ fontSize: 10, color: '#8A9690', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hoje</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2C3530' }}>8 agendamentos</div>
            </div>
          </div>
          {/* Floating card right */}
          <div className="hidden md:flex" style={{ position: 'absolute', right: -30, top: 80, background: '#fff', borderRadius: 16, padding: '13px 18px', boxShadow: '0 12px 40px rgba(44,53,48,0.12)', border: '1px solid #EDE8E0', alignItems: 'center', gap: 12, zIndex: 2, animation: 'float2 4s ease-in-out infinite' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 700 }}>✓</div>
            <div>
              <div style={{ fontSize: 10, color: '#8A9690', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>WhatsApp</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2C3530' }}>Novo cliente!</div>
            </div>
          </div>

          {/* Browser shell */}
          <div style={{ borderRadius: 22, overflow: 'hidden', boxShadow: '0 32px 80px rgba(44,53,48,0.16), 0 0 0 1px rgba(200,195,185,0.25)', background: '#fff' }}>
            {/* Browser bar */}
            <div style={{ background: '#F7F5F0', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #EDE8E0' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff6b6b','#ffd166','#A8C4AD'].map(c=>(
                  <div key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c }}/>
                ))}
              </div>
              <div style={{ flex: 1, background: '#EDE8E0', borderRadius: 8, padding: '5px 14px', fontSize: 12, color: '#8A9690', display: 'flex', alignItems: 'center', gap: 6 }}>
                🔒 <span>organizamais.com/dashboard</span>
              </div>
            </div>

            {/* Dashboard body */}
            <div style={{ display: 'flex', minHeight: 400 }}>
              {/* Sidebar */}
              <div className="hidden sm:flex" style={{ width: 210, background: '#2C3530', flexDirection: 'column', padding: '20px 0', gap: 2, flexShrink: 0 }}>
                <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 19, color: '#FAFAF7', padding: '0 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
                  Organiza<span style={{ color: '#A8C4AD' }}>+</span>
                </div>
                {[['📊','Dashboard',true],['📅','Agenda',false],['👥','Clientes',false],['🌐','Minha página',false],['⚙️','Configurações',false]].map(([ic,lb,ac])=>(
                  <div key={lb as string} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 10px', padding: '9px 12px', borderRadius: 10, fontSize: 13, fontWeight: 500, color: ac ? '#A8C4AD' : 'rgba(255,255,255,0.32)', background: ac ? 'rgba(122,158,135,0.18)' : 'transparent' }}>
                    <span>{ic}</span><span>{lb}</span>
                  </div>
                ))}
              </div>

              {/* Main */}
              <div style={{ flex: 1, background: '#F7F5F0', padding: '24px', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#2C3530', margin: 0 }}>Olá, Dra. Ana 👋</p>
                    <p style={{ fontSize: 12, color: '#8A9690', margin: '3px 0 0' }}>Sexta-feira, 13 de junho de 2025</p>
                  </div>
                  <span style={{ background: '#EAF3EC', color: '#7A9E87', fontSize: 11, fontWeight: 700, padding: '5px 13px', borderRadius: 100, border: '1px solid #D6E8DA' }}>✦ Premium</span>
                </div>

                {/* Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                  {[['Hoje','8','↑ +3 vs ontem'],['Clientes','42','↑ +12 novos'],['Pendentes','3','⏳ Aprovar']].map(([l,v,s])=>(
                    <div key={l} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid #EDE8E0', boxShadow: '0 2px 8px rgba(44,53,48,0.05)' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: '#8A9690', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{l}</p>
                      <p style={{ fontSize: 28, fontWeight: 800, color: '#2C3530', margin: '5px 0 3px', lineHeight: 1 }}>{v}</p>
                      <p style={{ fontSize: 11, color: '#7A9E87', margin: 0, fontWeight: 500 }}>{s}</p>
                    </div>
                  ))}
                </div>

                {/* Appointments */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EDE8E0', overflow: 'hidden' }}>
                  <div style={{ padding: '11px 16px', borderBottom: '1px solid #EDE8E0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#2C3530' }}>Próximos agendamentos</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#7A9E87', background: '#EAF3EC', padding: '3px 10px', borderRadius: 100, border: '1px solid #D6E8DA' }}>Hoje</span>
                  </div>
                  {[['09:00','Mariana S.','Consulta inicial',true],['10:30','Carlos M.','Retorno',true],['14:00','Laura P.','Avaliação',false]].map(([t,n,tp,ok])=>(
                    <div key={n as string} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: '1px solid rgba(237,232,224,0.6)' }}>
                      <div style={{ background: '#EAF3EC', color: '#7A9E87', fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 8, flexShrink: 0 }}>{t}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#2C3530', margin: 0 }}>{n as string}</p>
                        <p style={{ fontSize: 11, color: '#8A9690', margin: 0 }}>{tp as string}</p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: ok ? 'rgba(122,158,135,0.12)' : 'rgba(251,191,36,0.15)', color: ok ? '#7A9E87' : '#d97706', flexShrink: 0 }}>
                        {ok ? 'Confirmado' : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROFISSÕES ─── */}
      <div style={{ padding: '48px 24px', background: '#fff', borderTop: '1px solid #EDE8E0', borderBottom: '1px solid #EDE8E0', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#8A9690', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 22 }}>
          Para todos os profissionais de saúde e bem-estar
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 720, margin: '0 auto' }}>
          {['🧠 Psicólogo','💊 Psiquiatra','🥗 Nutricionista','🦷 Dentista','💆 Fisioterapeuta','⚕️ Médico','🌸 Esteticista','🧘 Terapeuta','🎯 Coach','🏃 Ed. Físico','✦ E muito mais'].map(p=>(
            <span key={p} style={{ background: '#F7F5F0', border: '1px solid #EDE8E0', borderRadius: 100, padding: '8px 18px', fontSize: 13, color: '#5A6660', fontWeight: 500, cursor: 'default', transition: 'all 0.18s' }}
              onMouseEnter={e=>{(e.target as HTMLElement).style.background='#EAF3EC';(e.target as HTMLElement).style.borderColor='#A8C4AD';(e.target as HTMLElement).style.color='#7A9E87'}}
              onMouseLeave={e=>{(e.target as HTMLElement).style.background='#F7F5F0';(e.target as HTMLElement).style.borderColor='#EDE8E0';(e.target as HTMLElement).style.color='#5A6660'}}>{p}</span>
          ))}
        </div>
      </div>

      {/* ─── COMO FUNCIONA ─── */}
      <section id="como-funciona" style={{ padding: '96px 24px', background: '#F7F5F0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Chip label="✦ Como funciona"/>
          <H2>Em minutos, sua página profissional está <em style={{ color: '#7A9E87', fontStyle: 'italic' }}>no ar.</em></H2>
          <Sub>Sem designer, sem site caro. O Organiza+ faz tudo automaticamente para você.</Sub>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20, marginTop: 56 }}>
            {[
              {n:'01', icon:'✍️', t:'Crie sua conta', d:'Cadastre-se em segundos, escolha sua profissão e preencha suas informações.'},
              {n:'02', icon:'🌐', t:'Página criada na hora', d:'Link único gerado automaticamente no instante em que você confirmar o cadastro.'},
              {n:'03', icon:'📅', t:'Configure horários', d:'Defina os dias e horários que você atende com controle total e visual.'},
              {n:'04', icon:'🔔', t:'Receba agendamentos', d:'Clientes agendam online e você recebe notificação no painel e no WhatsApp.'},
            ].map(s=>(
              <Card key={s.n} style={{ position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 52, color: 'rgba(122,158,135,0.11)', position: 'absolute', top: 10, right: 16, lineHeight: 1, userSelect: 'none' }}>{s.n}</span>
                <div style={{ width: 50, height: 50, background: '#EAF3EC', border: '1px solid #D6E8DA', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>{s.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#2C3530', marginBottom: 10 }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: '#5A6660', lineHeight: 1.65, margin: 0 }}>{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PÁGINA PÚBLICA ─── */}
      <section style={{ padding: '96px 24px', background: 'linear-gradient(140deg, #EAF3EC 0%, #F4EFE8 100%)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="grid-stack">
          <div>
            <Chip label="🌐 Sua página profissional"/>
            <H2>Uma página elegante que representa você com <em style={{ color: '#7A9E87', fontStyle: 'italic' }}>sofisticação.</em></H2>
            <Sub style={{ marginBottom: 36 }}>Cada profissional recebe uma página personalizada, responsiva e pronta para receber clientes.</Sub>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                {icon:'🔗', t:'Link personalizado', d:'organizamais.com/seu-nome — compartilhe nas redes e no WhatsApp.'},
                {icon:'📱', t:'100% responsiva', d:'Funciona perfeitamente em celular, tablet ou computador.'},
                {icon:'⚡', t:'Agendamento em 30 segundos', d:'O cliente agenda sem precisar ligar ou mandar mensagem.'},
                {icon:'💬', t:'Notificação WhatsApp', d:'Você recebe os dados completos do cliente instantaneamente.'},
              ].map(f=>(
                <div key={f.t} style={{ display: 'flex', gap: 14, background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 10px rgba(44,53,48,0.05)', transition: 'transform 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateX(4px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateX(0)'}>
                  <div style={{ width: 44, height: 44, background: '#EAF3EC', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#2C3530', margin: '0 0 3px' }}>{f.t}</p>
                    <p style={{ fontSize: 13, color: '#5A6660', margin: 0 }}>{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Profile card */}
          <div style={{ background: '#fff', borderRadius: 28, boxShadow: '0 24px 64px rgba(44,53,48,0.13)', overflow: 'hidden' }}>
            <div style={{ padding: '32px 28px 24px', background: 'linear-gradient(135deg, #2C3530 0%, #3d4f47 100%)' }}>
              <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#D6E8DA', border: '3px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16 }}>👩‍⚕️</div>
              <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, color: '#FAFAF7', margin: '0 0 5px' }}>Dra. Ana Beatriz</h3>
              <p style={{ fontSize: 14, color: '#A8C4AD', margin: '0 0 4px', fontWeight: 500 }}>Psicóloga Clínica — CRP 06/12345</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0 }}>📍 São Paulo, SP · Online e presencial</p>
            </div>
            <div style={{ padding: '22px 26px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                {['Ansiedade','Depressão','TCC','Relacionamentos'].map(t=>(
                  <span key={t} style={{ background: '#EAF3EC', border: '1px solid #D6E8DA', color: '#7A9E87', fontSize: 12, fontWeight: 600, padding: '5px 13px', borderRadius: 100 }}>{t}</span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: '#5A6660', lineHeight: 1.65, marginBottom: 18 }}>Especializada em TCC com 8 anos de experiência. Atendo adultos e adolescentes com foco em ansiedade e autoconhecimento.</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8A9690', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Horários disponíveis — Terça</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {[['09:00',true],['10:00',false],['14:00',false],['15:00',false]].map(([t,sel])=>(
                  <span key={t as string} style={{ border: `2px solid ${sel?'#7A9E87':'#EDE8E0'}`, background: sel?'#7A9E87':'#F7F5F0', color: sel?'#fff':'#2C3530', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{t as string}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, background: '#2C3530', color: '#FAFAF7', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#7A9E87'}
                  onMouseLeave={e=>e.currentTarget.style.background='#2C3530'}>
                  Agendar consulta →
                </button>
                <button style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: 12, padding: '14px 18px', fontSize: 20, cursor: 'pointer' }}>✉</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FUNCIONALIDADES ─── */}
      <section id="funcionalidades" style={{ padding: '96px 24px', background: '#2C3530' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Chip label="✦ Funcionalidades" dark/>
          <H2 style={{ color: '#FAFAF7', maxWidth: 620 }}>Tudo que você precisa para <em style={{ color: '#A8C4AD', fontStyle: 'italic' }}>organizar e crescer</em> sua agenda.</H2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginTop: 56 }}>
            {[
              {icon:'📊', t:'Dashboard completo', d:'Visualize agendamentos, clientes e métricas em tempo real.'},
              {icon:'🗓️', t:'Gestão de horários', d:'Defina disponibilidade, bloqueie datas com total controle.'},
              {icon:'🌐', t:'Página automática', d:'Gerada ao criar a conta — elegante e pronta para compartilhar.'},
              {icon:'💬', t:'WhatsApp automático', d:'Notificação instantânea com todos os dados do cliente.'},
              {icon:'🎨', t:'8 temas de cores', d:'Personalize as cores da sua página com um clique.'},
              {icon:'🔒', t:'Multi-usuário seguro', d:'Cada conta é isolada e protegida com segurança total.'},
            ].map(f=>(
              <div key={f.t} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '28px', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(122,158,135,0.1)';e.currentTarget.style.borderColor='rgba(122,158,135,0.25)';e.currentTarget.style.transform='translateY(-3px)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='translateY(0)'}}>
                <div style={{ fontSize: 26, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#FAFAF7', marginBottom: 8 }}>{f.t}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLANOS ─── */}
      <section id="planos" style={{ padding: '96px 24px', background: '#F4EFE8' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <Chip label="💰 Planos"/>
          <H2>Simples, transparente e <em style={{ color: '#7A9E87', fontStyle: 'italic' }}>acessível.</em></H2>
          <Sub style={{ marginBottom: 56 }}>Sem surpresas. Cancele quando quiser. Comece em minutos.</Sub>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24, maxWidth: 720, margin: '0 auto' }}>
            {[
              { name:'🌿 Basic', price:'27', features:['Página profissional','Link personalizado','Agendamento online','Integração WhatsApp','Responsivo mobile'], href:'/cadastro?plano=basic', featured: false },
              { name:'💎 Premium', price:'47', features:['Tudo do Basic','Painel administrativo','Gestão de horários','8 temas de cores','Upload de fotos','Analytics completo','SEO básico incluso'], href:'/cadastro?plano=premium', featured: true },
            ].map(p=>(
              <div key={p.name} style={{ background: p.featured?'#2C3530':'#fff', borderRadius: 28, padding: '36px 32px', border: p.featured?'none':'2px solid #EDE8E0', boxShadow: p.featured?'0 24px 60px rgba(44,53,48,0.16)':'0 4px 20px rgba(44,53,48,0.06)', position: 'relative', outline: p.featured?'2px solid #7A9E87':'none', transition: 'transform 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-5px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                {p.featured && <div style={{ position: 'absolute', top: 18, right: 18, background: '#7A9E87', color: '#FAFAF7', fontSize: 10, fontWeight: 700, padding: '4px 13px', borderRadius: 100 }}>Mais popular</div>}
                <p style={{ fontSize: 12, fontWeight: 700, color: p.featured?'#A8C4AD':'#8A9690', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{p.name}</p>
                <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 54, color: p.featured?'#FAFAF7':'#2C3530', lineHeight: 1, marginBottom: 4 }}>R${p.price}</div>
                <p style={{ fontSize: 14, color: p.featured?'rgba(255,255,255,0.38)':'#8A9690', marginBottom: 28 }}>por mês</p>
                <hr style={{ border: 'none', borderTop: `1px solid ${p.featured?'rgba(255,255,255,0.08)':'#EDE8E0'}`, marginBottom: 28 }}/>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px', display: 'flex', flexDirection: 'column', gap: 13, textAlign: 'left' }}>
                  {p.features.map(f=>(
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: p.featured?'rgba(255,255,255,0.72)':'#5A6660', fontWeight: 500 }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: p.featured?'rgba(168,196,173,0.2)':'#EAF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: p.featured?'#A8C4AD':'#7A9E87', fontWeight: 700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} style={{ display: 'block', textAlign: 'center', padding: '15px', borderRadius: 13, fontSize: 15, fontWeight: 700, textDecoration: 'none', background: p.featured?'#7A9E87':'transparent', color: p.featured?'#FAFAF7':'#2C3530', border: p.featured?'none':'2px solid #EDE8E0', transition: 'all 0.2s' }}
                  onMouseEnter={e=>{if(p.featured){e.currentTarget.style.background='#A8C4AD'}else{e.currentTarget.style.background='#EAF3EC';e.currentTarget.style.borderColor='#7A9E87'}}}
                  onMouseLeave={e=>{if(p.featured){e.currentTarget.style.background='#7A9E87'}else{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='#EDE8E0'}}}>
                  {p.featured ? 'Começar Premium →' : 'Começar Basic'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEPOIMENTOS ─── */}
      <section style={{ padding: '96px 24px', background: '#FAFAF7' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <Chip label="💬 Depoimentos"/>
          <H2 style={{ marginBottom: 52 }}>Quem usa, <em style={{ color: '#7A9E87', fontStyle: 'italic' }}>ama.</em></H2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22 }}>
            {[
              {emoji:'🧠', name:'Dra. Camila R.', role:'Psicóloga · São Paulo', text:'Reduzi em 90% o tempo respondendo mensagens sobre agendamento. Meus clientes adoram a praticidade da minha página.'},
              {emoji:'🥗', name:'Fernanda M.', role:'Nutricionista · Curitiba', text:'Finalmente tenho uma página profissional linda sem pagar caro por um site. O visual impressiona muito!'},
              {emoji:'💆', name:'Rafael S.', role:'Fisioterapeuta · BH', text:'Recebi o aviso no WhatsApp na hora. Nunca mais perdi uma consulta por falta de comunicação com o cliente.'},
            ].map(t=>(
              <Card key={t.name}>
                <div style={{ color: '#f5c842', fontSize: 16, marginBottom: 14, letterSpacing: 2 }}>★★★★★</div>
                <p style={{ fontSize: 15, color: '#5A6660', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 22 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#EAF3EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{t.emoji}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#2C3530', margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: '#8A9690', margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section style={{ padding: '110px 24px', background: '#2C3530', textAlign: 'center', backgroundImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, rgba(122,158,135,0.13) 0%, transparent 70%)' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(34px,5vw,60px)', color: '#FAFAF7', lineHeight: 1.12, maxWidth: 640, margin: '0 auto 18px' }}>
          Pronto para transformar sua <em style={{ color: '#A8C4AD', fontStyle: 'italic' }}>agenda profissional?</em>
        </h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.48)', maxWidth: 440, margin: '0 auto 44px' }}>
          Crie sua conta agora. Sua página profissional no ar em menos de 5 minutos.
        </p>
        <Link href="/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#7A9E87', color: '#FAFAF7', padding: '18px 48px', borderRadius: 14, fontSize: 17, fontWeight: 700, textDecoration: 'none', boxShadow: '0 14px 40px rgba(122,158,135,0.35)', transition: 'all 0.2s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#A8C4AD';e.currentTarget.style.transform='translateY(-2px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='#7A9E87';e.currentTarget.style.transform='translateY(0)'}}>
          ✦ Começar agora — é grátis <ArrowRight size={19}/>
        </Link>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#2C3530', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: 'rgba(255,255,255,0.18)', marginBottom: 8 }}>
          Organiza<span style={{ color: 'rgba(122,158,135,0.45)' }}>+</span>
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', margin: 0 }}>© 2025 Organiza+. Feito com 💚 para profissionais modernos.</p>
      </footer>

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(9px)} }
        .grid-stack { grid-template-columns: 1fr 1fr !important; }
        @media(max-width:768px) {
          .grid-stack { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ── Small reusable components ──
function Chip({ label, dark }: { label: string; dark?: boolean }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: dark ? 'rgba(122,158,135,0.15)' : '#EAF3EC', border: `1px solid ${dark ? 'rgba(122,158,135,0.25)' : '#D6E8DA'}`, borderRadius: 100, padding: '5px 15px', fontSize: 12, fontWeight: 600, color: dark ? '#A8C4AD' : '#7A9E87', marginBottom: 18 }}>{label}</div>
  )
}
function H2({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 'clamp(28px,4vw,46px)', color: '#2C3530', lineHeight: 1.12, marginBottom: 14, ...style }}>{children}</h2>
}
function Sub({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: 18, color: '#5A6660', lineHeight: 1.65, maxWidth: 500, marginBottom: 0, ...style }}>{children}</p>
}
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #EDE8E0', boxShadow: '0 2px 12px rgba(44,53,48,0.06)', padding: '28px', transition: 'transform 0.2s, box-shadow 0.2s', ...style }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(44,53,48,0.10)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 12px rgba(44,53,48,0.06)'}}>
      {children}
    </div>
  )
}
