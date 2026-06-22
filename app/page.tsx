'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, Check, Star, Menu, X, Zap, Shield } from 'lucide-react'
import { T, GlobalStyles } from '@/lib/ds'

export default function Home() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [isMobile, setIsMobile]   = useState(false)
  const [mounted, setMounted]     = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', check)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', check) }
  }, [])

  return (
    <div style={{ fontFamily:T.fontSans, background:T.cream, color:T.dark, overflowX:'hidden', WebkitFontSmoothing:'antialiased' }}>
      <GlobalStyles/>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .fade-up-d1 { animation: fadeUp 0.6s 0.12s ease both; }
        .fade-up-d2 { animation: fadeUp 0.6s 0.24s ease both; }
        a,button { -webkit-tap-highlight-color: transparent; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ══════════════════════════ NAV ══════════════════════════ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:200,
        padding: isMobile ? '0 16px' : '0 40px',
        height:60, display:'flex', alignItems:'center', justifyContent:'space-between',
        background: scrolled||menuOpen ? 'rgba(250,250,247,0.97)' : 'rgba(250,250,247,0.75)',
        backdropFilter:'blur(20px)',
        borderBottom: scrolled||menuOpen ? `1px solid ${T.nude}` : '1px solid transparent',
        boxShadow: scrolled ? T.shadowSm : 'none',
        transition:'all 0.3s ease',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', flexShrink:0 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:T.sage }}/>
          <span style={{ fontFamily:T.fontSerif, fontSize:19, color:T.dark }}>
            Organiza<span style={{ color:T.sage }}>+</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display:'flex', alignItems:'center', gap:32 }}>
            {[['#como-funciona','Como funciona'],['#funcionalidades','Funcionalidades'],['#planos','Planos']].map(([h,l])=>(
              <a key={h} href={h} style={{ fontSize:14, fontWeight:500, color:T.mid, textDecoration:'none', transition:'color 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.color=T.dark} onMouseLeave={e=>e.currentTarget.style.color=T.mid}>{l}</a>
            ))}
            <Link href="/login" style={{ fontSize:14, fontWeight:500, color:T.mid, textDecoration:'none', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color=T.dark} onMouseLeave={e=>e.currentTarget.style.color=T.mid}>Entrar</Link>
            <Link href="/cadastro" style={{ background:T.dark, color:T.cream, padding:'9px 20px', borderRadius:T.r12, fontSize:14, fontWeight:700, textDecoration:'none', transition:'background 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.background=T.sage} onMouseLeave={e=>e.currentTarget.style.background=T.dark}>
              Começar agora →
            </Link>
          </div>
        )}

        {/* Mobile nav */}
        {isMobile && (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Link href="/login" style={{ fontSize:13, fontWeight:600, color:T.mid, textDecoration:'none', padding:'7px 12px', borderRadius:T.r10, border:`1.5px solid ${T.nude}`, lineHeight:1 }}>
              Entrar
            </Link>
            <Link href="/cadastro" style={{ background:T.dark, color:T.cream, padding:'7px 14px', borderRadius:T.r10, fontSize:13, fontWeight:700, textDecoration:'none', lineHeight:1 }}>
              Começar
            </Link>
            <button onClick={()=>setMenuOpen(!menuOpen)}
              style={{ background:'none', border:'none', cursor:'pointer', color:T.dark, padding:6, display:'flex', alignItems:'center', borderRadius:T.r8, marginLeft:2 }}>
              {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && isMobile && (
        <div style={{ position:'fixed', top:60, left:0, right:0, zIndex:199, background:T.cream, borderBottom:`1px solid ${T.nude}`, padding:'4px 0 8px', boxShadow:T.shadowMd }}>
          {[['#como-funciona','Como funciona'],['#funcionalidades','Funcionalidades'],['#planos','Planos']].map(([h,l])=>(
            <a key={h} href={h} onClick={()=>setMenuOpen(false)}
              style={{ display:'block', padding:'13px 20px', fontSize:15, fontWeight:500, color:T.dark, textDecoration:'none', borderBottom:`1px solid ${T.nude}` }}>{l}</a>
          ))}
        </div>
      )}

      {/* ══════════════════════════ HERO ══════════════════════════ */}
      <section style={{
        minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center',
        textAlign:'center', padding: isMobile ? '100px 20px 60px' : '130px 24px 80px',
        background:`radial-gradient(ellipse 90% 55% at 50% -5%, rgba(122,158,135,0.15) 0%, transparent 65%), ${T.cream}`,
        opacity: mounted ? 1 : 0, transition:'opacity 0.5s ease',
      }}>
        {/* Badge */}
        <div className="fade-up" style={{ display:'inline-flex', alignItems:'center', gap:8, background:T.sageG, border:`1px solid ${T.sageP}`, borderRadius:T.r100, padding:'6px 16px', fontSize:12, fontWeight:700, color:T.sage, marginBottom:28 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:T.sage }}/>
          Agendamento profissional simplificado
        </div>

        {/* H1 */}
        <h1 className="fade-up-d1" style={{ fontFamily:T.fontSerif, fontSize: isMobile ? 36 : 'clamp(42px,6vw,76px)', lineHeight:1.06, letterSpacing:'-0.025em', color:T.dark, maxWidth:820, marginBottom:20 }}>
          Tenha sua página profissional e receba agendamentos{' '}
          <em style={{ color:T.sage, fontStyle:'italic' }}>online</em> automaticamente.
        </h1>

        {/* Sub */}
        <p className="fade-up-d2" style={{ fontSize: isMobile ? 16 : 19, color:T.mid, maxWidth:520, lineHeight:1.7, marginBottom:36 }}>
          Organize sua agenda, compartilhe seu link e permita que clientes agendem em segundos.
        </p>

        {/* CTAs */}
        <div className="fade-up-d2" style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:44, width:'100%', maxWidth: isMobile ? '100%' : 'auto', padding: isMobile ? '0 4px' : 0 }}>
          <Link href="/cadastro" style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
            background:T.dark, color:T.cream,
            padding: isMobile ? '14px 28px' : '16px 36px',
            borderRadius:T.r14, fontSize: isMobile ? 15 : 16, fontWeight:700, textDecoration:'none',
            boxShadow:`0 8px 28px rgba(44,53,48,0.2)`, transition:'all 0.2s',
            flex: isMobile ? 1 : 'none', maxWidth: isMobile ? 240 : 'none',
          }}
            onMouseEnter={e=>{e.currentTarget.style.background=T.sage;e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background=T.dark;e.currentTarget.style.transform='translateY(0)'}}>
            ✦ Começar agora grátis
          </Link>
          <a href="#como-funciona" style={{
            display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
            background:'transparent', color:T.dark,
            padding: isMobile ? '14px 20px' : '16px 28px',
            borderRadius:T.r14, fontSize: isMobile ? 15 : 16, fontWeight:600, textDecoration:'none',
            border:`2px solid ${T.nude}`, transition:'all 0.2s',
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.sageL;e.currentTarget.style.background=T.sageG}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.nude;e.currentTarget.style.background='transparent'}}>
            Como funciona <ArrowRight size={16}/>
          </a>
        </div>

        {/* Trust */}
        <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:13, color:T.muted, marginBottom: isMobile ? 40 : 64 }}>
          <div style={{ display:'flex' }}>
            {['🧠','🌿','🦷','💆'].map((e,i)=>(
              <div key={i} style={{ width:32, height:32, borderRadius:'50%', border:`2px solid ${T.cream}`, background:T.sageP, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, marginLeft:i===0?0:-9 }}>{e}</div>
            ))}
          </div>
          <span style={{ fontSize: isMobile ? 12 : 13 }}>Feito para psicólogos, nutricionistas, dentistas e outros profissionais de saúde</span>
        </div>

        {/* Dashboard mockup */}
        {!isMobile && (
          <div style={{ width:'100%', maxWidth:940, position:'relative' }}>
            {/* Floating cards */}
            <div style={{ position:'absolute', left:-20, bottom:80, background:T.white, borderRadius:T.r16, padding:'13px 18px', boxShadow:T.shadowLg, border:`1px solid ${T.nude}`, display:'flex', alignItems:'center', gap:12, zIndex:2, animation:'float1 3.5s ease-in-out infinite' }}>
              <div style={{ width:40, height:40, borderRadius:T.r12, background:T.sageG, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>📅</div>
              <div><p style={{ fontSize:10, color:T.muted, fontWeight:700, textTransform:'uppercase', margin:0 }}>Hoje</p><p style={{ fontSize:14, fontWeight:700, color:T.dark, margin:0 }}>8 agendamentos</p></div>
            </div>
            <div style={{ position:'absolute', right:-20, top:80, background:T.white, borderRadius:T.r16, padding:'13px 18px', boxShadow:T.shadowLg, border:`1px solid ${T.nude}`, display:'flex', alignItems:'center', gap:12, zIndex:2, animation:'float2 4s ease-in-out infinite' }}>
              <div style={{ width:40, height:40, borderRadius:T.r12, background:'#25D36620', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>✓</div>
              <div><p style={{ fontSize:10, color:T.muted, fontWeight:700, textTransform:'uppercase', margin:0 }}>WhatsApp</p><p style={{ fontSize:14, fontWeight:700, color:T.dark, margin:0 }}>Novo cliente!</p></div>
            </div>
            {/* Browser shell */}
            <div style={{ borderRadius:20, overflow:'hidden', boxShadow:`0 28px 80px rgba(44,53,48,0.16), 0 0 0 1px rgba(200,195,185,0.25)`, background:T.white }}>
              <div style={{ background:T.off, padding:'11px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${T.nude}` }}>
                <div style={{ display:'flex', gap:5 }}>{['#ff6b6b','#ffd166',T.sageL].map(c=><div key={c} style={{ width:12, height:12, borderRadius:'50%', background:c }}/>)}</div>
                <div style={{ flex:1, background:T.nude, borderRadius:6, padding:'5px 12px', fontSize:11, color:T.muted }}>🔒 organizamais.com/dashboard</div>
              </div>
              <div style={{ display:'flex', minHeight:360 }}>
                <div style={{ width:200, background:T.dark, padding:'18px 0', display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
                  <div style={{ fontFamily:T.fontSerif, fontSize:17, color:T.cream, padding:'0 18px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:6 }}>Organiza<span style={{ color:T.sageL }}>+</span></div>
                  {[['📊','Dashboard',true],['📅','Agenda',false],['👥','Clientes',false],['🌐','Minha página',false]].map(([ic,lb,ac])=>(
                    <div key={lb as string} style={{ display:'flex', alignItems:'center', gap:9, margin:'2px 10px', padding:'8px 12px', borderRadius:10, fontSize:13, fontWeight:500, background:ac?'rgba(122,158,135,0.18)':'transparent', color:ac?T.sageL:'rgba(255,255,255,0.32)' }}>{ic} {lb}</div>
                  ))}
                </div>
                <div style={{ flex:1, background:T.off, padding:22, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
                    <div><p style={{ fontWeight:700, fontSize:14, color:T.dark, margin:0 }}>Olá, Dra. Ana 👋</p><p style={{ fontSize:11, color:T.muted, margin:'2px 0 0' }}>Sexta-feira, 13 de junho de 2025</p></div>
                    <span style={{ background:T.sageG, color:T.sage, fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:T.r100, border:`1px solid ${T.sageP}` }}>✦ Premium</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
                    {[['Hoje','8','↑ +3'],['Clientes','42','↑ +12'],['Pendentes','3','⏳']].map(([l,v,s])=>(
                      <div key={l} style={{ background:T.white, borderRadius:12, padding:'12px 14px', border:`1px solid ${T.nude}`, boxShadow:T.shadowSm }}>
                        <p style={{ fontSize:9, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>{l}</p>
                        <p style={{ fontSize:24, fontWeight:800, color:T.dark, margin:'4px 0 2px', lineHeight:1 }}>{v}</p>
                        <p style={{ fontSize:10, color:T.sage, margin:0, fontWeight:500 }}>{s}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:T.white, borderRadius:12, border:`1px solid ${T.nude}`, overflow:'hidden' }}>
                    <div style={{ padding:'10px 14px', borderBottom:`1px solid ${T.nude}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:T.dark }}>Próximos agendamentos</span>
                      <span style={{ fontSize:9, fontWeight:700, color:T.sage, background:T.sageG, padding:'2px 8px', borderRadius:T.r100 }}>Hoje</span>
                    </div>
                    {[['09:00','Mariana S.','Consulta inicial',true],['10:30','Carlos M.','Retorno',true],['14:00','Laura P.','Avaliação',false]].map(([t,n,tp,ok])=>(
                      <div key={n as string} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:`1px solid rgba(237,232,224,0.5)` }}>
                        <div style={{ background:T.sageG, color:T.sage, fontSize:10, fontWeight:700, padding:'4px 8px', borderRadius:7, flexShrink:0 }}>{t}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:12, fontWeight:600, color:T.dark, margin:0 }}>{n as string}</p>
                          <p style={{ fontSize:10, color:T.muted, margin:0 }}>{tp as string}</p>
                        </div>
                        <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:T.r100, background:ok?'rgba(122,158,135,0.12)':'rgba(217,119,6,0.1)', color:ok?T.sage:'#d97706', flexShrink:0 }}>
                          {ok?'Confirmado':'Pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile: simple feature pills instead of dashboard */}
        {isMobile && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', maxWidth:360 }}>
            {['📅 Agendamento automático','💬 Notificação WhatsApp','🌐 Página profissional','📊 Painel completo'].map(f=>(
              <span key={f} style={{ background:T.white, border:`1px solid ${T.nude}`, borderRadius:T.r100, padding:'8px 16px', fontSize:13, color:T.mid, fontWeight:500, boxShadow:T.shadowSm }}>{f}</span>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════ PROFISSÕES ══════════════════════════ */}
      <div style={{ padding: isMobile ? '36px 20px' : '44px 24px', background:T.white, borderTop:`1px solid ${T.nude}`, borderBottom:`1px solid ${T.nude}`, textAlign:'center' }}>
        <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:18 }}>
          Para todos os profissionais de saúde e bem-estar
        </p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', maxWidth:700, margin:'0 auto' }}>
          {['🧠 Psicólogo','💊 Psiquiatra','🥗 Nutricionista','🦷 Dentista','💆 Fisioterapeuta','⚕️ Médico','🌸 Esteticista','🧘 Terapeuta','🎯 Coach','✦ E muito mais'].map(p=>(
            <span key={p} style={{ background:T.off, border:`1px solid ${T.nude}`, borderRadius:T.r100, padding:'7px 16px', fontSize: isMobile ? 12 : 13, color:T.mid, fontWeight:500, cursor:'default', transition:'all 0.18s' }}
              onMouseEnter={e=>{(e.target as HTMLElement).style.background=T.sageG;(e.target as HTMLElement).style.borderColor=T.sageL;(e.target as HTMLElement).style.color=T.sage}}
              onMouseLeave={e=>{(e.target as HTMLElement).style.background=T.off;(e.target as HTMLElement).style.borderColor=T.nude;(e.target as HTMLElement).style.color=T.mid}}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════ COMO FUNCIONA ══════════════════════════ */}
      <section id="como-funciona" style={{ padding: isMobile ? '64px 20px' : '96px 24px', background:T.off }}>
        <div style={{ maxWidth:1080, margin:'0 auto' }}>
          <SectionChip label="✦ Como funciona"/>
          <h2 style={{ fontFamily:T.fontSerif, fontSize: isMobile ? 28 : 'clamp(28px,4vw,44px)', color:T.dark, marginBottom:12, lineHeight:1.12 }}>
            Em minutos, sua página profissional está <em style={{ color:T.sage, fontStyle:'italic' }}>no ar.</em>
          </h2>
          <p style={{ fontSize: isMobile ? 15 : 17, color:T.muted, marginBottom: isMobile ? 40 : 56, maxWidth:480, lineHeight:1.65 }}>
            Sem designer, sem site caro. O Organiza+ faz tudo automaticamente.
          </p>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
            {[
              { n:'01', icon:'✍️', t:'Crie sua conta', d:'Cadastre-se em segundos, escolha sua profissão e preencha suas informações.' },
              { n:'02', icon:'🌐', t:'Página criada na hora', d:'Link único gerado automaticamente no instante que você confirmar o cadastro.' },
              { n:'03', icon:'📅', t:'Configure horários', d:'Defina os dias e horários que você atende com controle total e visual.' },
              { n:'04', icon:'🔔', t:'Receba agendamentos', d:'Clientes agendam online e você recebe notificação no painel e no WhatsApp.' },
            ].map(s=>(
              <StepCard key={s.n} {...s}/>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ PÁGINA PÚBLICA ══════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '96px 24px', background:`linear-gradient(140deg, ${T.sageG} 0%, ${T.begeP} 100%)` }}>
        <div style={{ maxWidth:1080, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 32 : 64, alignItems:'center' }}>
          <div>
            <SectionChip label="🌐 Sua página profissional"/>
            <h2 style={{ fontFamily:T.fontSerif, fontSize: isMobile ? 28 : 'clamp(28px,4vw,40px)', color:T.dark, marginBottom:16, lineHeight:1.12 }}>
              Uma página elegante que representa você com <em style={{ color:T.sage, fontStyle:'italic' }}>sofisticação.</em>
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color:T.mid, marginBottom:24, lineHeight:1.7 }}>
              Cada profissional recebe uma página personalizada, responsiva e pronta para receber clientes.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { icon:'🔗', t:'Link personalizado', d:'organizamais.com/seu-nome — compartilhe nas redes.' },
                { icon:'📱', t:'100% responsiva', d:'Funciona perfeitamente em qualquer dispositivo.' },
                { icon:'⚡', t:'Agendamento em 30 segundos', d:'O cliente agenda sem precisar ligar.' },
                { icon:'💬', t:'Notificação WhatsApp', d:'Você recebe os dados completos instantaneamente.' },
              ].map(f=>(
                <div key={f.t} style={{ display:'flex', gap:12, background:T.white, borderRadius:T.r16, padding:'14px 16px', boxShadow:T.shadowSm, transition:'transform 0.18s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateX(4px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateX(0)'}>
                  <div style={{ width:40, height:40, background:T.sageG, borderRadius:T.r12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:13, color:T.dark, margin:'0 0 2px' }}>{f.t}</p>
                    <p style={{ fontSize:12, color:T.mid, margin:0 }}>{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile card mockup */}
          <ProfileCardMockup/>
        </div>
      </section>

      {/* ══════════════════════════ FUNCIONALIDADES ══════════════════════════ */}
      <section id="funcionalidades" style={{ padding: isMobile ? '64px 20px' : '96px 24px', background:T.dark }}>
        <div style={{ maxWidth:1080, margin:'0 auto' }}>
          <SectionChip label="✦ Funcionalidades" dark/>
          <h2 style={{ fontFamily:T.fontSerif, fontSize: isMobile ? 28 : 'clamp(28px,4vw,44px)', color:T.cream, marginBottom: isMobile ? 40 : 56, lineHeight:1.12, maxWidth:580 }}>
            Tudo que você precisa para <em style={{ color:T.sageL, fontStyle:'italic' }}>organizar e crescer.</em>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 16 }}>
            {[
              { icon:'📊', t:'Dashboard completo',      d:'Agendamentos, clientes e métricas em tempo real.' },
              { icon:'🗓️', t:'Gestão de horários',      d:'Defina disponibilidade e bloqueie datas facilmente.' },
              { icon:'🌐', t:'Página automática',        d:'Gerada ao criar a conta, pronta para compartilhar.' },
              { icon:'💬', t:'WhatsApp automático',      d:'Notificação instantânea com dados do cliente.' },
              { icon:'🎨', t:'8 temas de cores',         d:'Personalize as cores da sua página com um clique.' },
              { icon:'🔒', t:'Multi-usuário seguro',     d:'Cada conta é isolada e protegida.' },
            ].map(f=>(
              <FeatCard key={f.t} {...f} mobile={isMobile}/>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ PLANOS ══════════════════════════ */}
      <section id="planos" style={{ padding: isMobile ? '64px 20px' : '96px 24px', background:T.begeP }}>
        <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          <SectionChip label="💰 Planos"/>
          <h2 style={{ fontFamily:T.fontSerif, fontSize: isMobile ? 28 : 'clamp(28px,4vw,44px)', color:T.dark, marginBottom:10, lineHeight:1.12 }}>
            Simples, transparente e <em style={{ color:T.sage, fontStyle:'italic' }}>acessível.</em>
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 16, color:T.muted, marginBottom: isMobile ? 36 : 52 }}>
            Sem surpresas. Cancele quando quiser.
          </p>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:20, maxWidth:720, margin:'0 auto' }}>
            <PlanCard
              name="🌿 Basic" price="27"
              features={['Página profissional','Link personalizado','Agendamento online','Integração WhatsApp','Responsivo mobile']}
              cta="Começar Basic" href="/cadastro?plano=basic" featured={false}/>
            <PlanCard
              name="💎 Premium" price="47"
              features={['Tudo do Basic','Painel administrativo','Gestão de horários','8 temas de cores','Upload de fotos','Analytics completo','SEO básico incluso']}
              cta="Começar Premium →" href="/cadastro?plano=premium" featured={true} badge="Mais popular"/>
          </div>
        </div>
      </section>

      {/* ══════════════════════════ POR QUE ORGANIZA+ ══════════════════════════ */}
      <section style={{ padding: isMobile ? '64px 20px' : '96px 24px', background:T.cream }}>
        <div style={{ maxWidth:1080, margin:'0 auto' }}>
          <SectionChip label="✦ Por que escolher"/>
          <h2 style={{ fontFamily:T.fontSerif, fontSize: isMobile ? 28 : 'clamp(28px,4vw,44px)', color:T.dark, marginBottom: isMobile ? 32 : 52, lineHeight:1.12 }}>
            Construído para <em style={{ color:T.sage, fontStyle:'italic' }}>profissionais de verdade.</em>
          </h2>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:18 }}>
            {[
              { e:'🎨', t:'Identidade só sua', d:'Página com copy e visual pensados para a sua profissão — não um perfil genérico dentro de um marketplace.' },
              { e:'⚡', t:'No ar em minutos', d:'Cadastre-se, configure horários e compartilhe seu link. Sem precisar contratar ninguém para criar um site.' },
              { e:'💬', t:'Aviso instantâneo', d:'Toda vez que alguém agenda, você recebe a notificação no WhatsApp com os dados do cliente.' },
            ].map(t=>(
              <BenefitCard key={t.t} {...t}/>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════ CTA FINAL ══════════════════════════ */}
      <section style={{ padding: isMobile ? '72px 20px' : '110px 24px', background:T.dark, textAlign:'center', backgroundImage:`radial-gradient(ellipse 70% 60% at 50% 50%, rgba(122,158,135,0.13) 0%, transparent 70%)` }}>
        <h2 style={{ fontFamily:T.fontSerif, fontSize: isMobile ? 30 : 'clamp(32px,5vw,56px)', color:T.cream, lineHeight:1.12, maxWidth:600, margin:'0 auto 14px' }}>
          Pronto para transformar sua <em style={{ color:T.sageL, fontStyle:'italic' }}>agenda profissional?</em>
        </h2>
        <p style={{ fontSize: isMobile ? 15 : 17, color:'rgba(255,255,255,0.48)', maxWidth:420, margin:'0 auto 36px' }}>
          Sua página profissional no ar em menos de 5 minutos.
        </p>
        <Link href="/cadastro" style={{ display:'inline-flex', alignItems:'center', gap:10, background:T.sage, color:T.cream, padding: isMobile ? '14px 28px' : '17px 44px', borderRadius:T.r14, fontSize: isMobile ? 15 : 17, fontWeight:700, textDecoration:'none', boxShadow:`0 12px 36px rgba(122,158,135,0.35)`, transition:'all 0.2s' }}
          onMouseEnter={e=>{e.currentTarget.style.background=T.sageL;e.currentTarget.style.transform='translateY(-2px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background=T.sage;e.currentTarget.style.transform='translateY(0)'}}>
          ✦ Começar agora — é grátis <ArrowRight size={18}/>
        </Link>
      </section>

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer style={{ background:T.dark, borderTop:'1px solid rgba(255,255,255,0.06)', padding: isMobile ? '28px 20px' : '36px 24px', textAlign:'center' }}>
        <p style={{ fontFamily:T.fontSerif, fontSize:17, color:'rgba(255,255,255,0.18)', marginBottom:6 }}>Organiza<span style={{ color:'rgba(122,158,135,0.45)' }}>+</span></p>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.18)', margin:'0 0 12px' }}>© 2026 Organiza+. Feito com 💚 para profissionais modernos.</p>
        <div style={{ display:'flex', gap:16, justifyContent:'center' }}>
          <Link href="/termos" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Termos de Uso</Link>
          <Link href="/privacidade" style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>Privacidade</Link>
        </div>
      </footer>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────
function SectionChip({ label, dark }: { label:string, dark?:boolean }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:dark?'rgba(122,158,135,0.15)':T.sageG, border:`1px solid ${dark?'rgba(122,158,135,0.25)':T.sageP}`, borderRadius:T.r100, padding:'5px 14px', fontSize:12, fontWeight:700, color:dark?T.sageL:T.sage, marginBottom:18 }}>
      {label}
    </div>
  )
}

function StepCard({ n, icon, t, d }: { n:string, icon:string, t:string, d:string }) {
  const [h,setH] = useState(false)
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:T.white, borderRadius:T.r20, padding:'26px 22px', border:`1px solid ${T.nude}`, boxShadow:h?T.shadowMd:T.shadowCard, position:'relative', overflow:'hidden', transition:'all 0.2s', transform:h?'translateY(-3px)':'none' }}>
      <span style={{ fontFamily:T.fontSerif, fontSize:48, color:`rgba(122,158,135,0.1)`, position:'absolute', top:10, right:14, lineHeight:1, userSelect:'none' }}>{n}</span>
      <div style={{ width:48, height:48, background:T.sageG, border:`1px solid ${T.sageP}`, borderRadius:T.r14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:18 }}>{icon}</div>
      <h3 style={{ fontSize:15, fontWeight:700, color:T.dark, marginBottom:8 }}>{t}</h3>
      <p style={{ fontSize:13, color:T.mid, lineHeight:1.65, margin:0 }}>{d}</p>
    </div>
  )
}

function FeatCard({ icon, t, d, mobile }: { icon:string, t:string, d:string, mobile:boolean }) {
  const [h,setH] = useState(false)
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:h?'rgba(122,158,135,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${h?'rgba(122,158,135,0.22)':'rgba(255,255,255,0.07)'}`, borderRadius:T.r20, padding: mobile ? '18px 14px' : '26px', transition:'all 0.2s', transform:h?'translateY(-3px)':'none' }}>
      <div style={{ fontSize: mobile ? 24 : 26, marginBottom: mobile ? 10 : 14 }}>{icon}</div>
      <h3 style={{ fontSize: mobile ? 13 : 15, fontWeight:700, color:T.cream, marginBottom: mobile ? 5 : 8 }}>{t}</h3>
      <p style={{ fontSize: mobile ? 11 : 13, color:'rgba(255,255,255,0.42)', lineHeight:1.65, margin:0 }}>{d}</p>
    </div>
  )
}

function ProfileCardMockup() {
  return (
    <div style={{ background:T.white, borderRadius:T.r24, boxShadow:T.shadowXl, overflow:'hidden' }}>
      <div style={{ padding:'28px 24px 22px', background:`linear-gradient(135deg, ${T.dark} 0%, #3d4f47 100%)` }}>
        <div style={{ width:68, height:68, borderRadius:'50%', background:T.sageP, border:'3px solid rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:14 }}>👩‍⚕️</div>
        <h3 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.cream, margin:'0 0 4px' }}>Dra. Ana Beatriz</h3>
        <p style={{ fontSize:13, color:T.sageL, margin:'0 0 3px', fontWeight:500 }}>Psicóloga Clínica — CRP 06/12345</p>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', margin:0 }}>📍 São Paulo, SP · Online e presencial</p>
      </div>
      <div style={{ padding:'20px 22px' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:16 }}>
          {['Ansiedade','Depressão','TCC','Relacionamentos'].map(t=>(
            <span key={t} style={{ background:T.sageG, border:`1px solid ${T.sageP}`, color:T.sage, fontSize:11, fontWeight:600, padding:'4px 11px', borderRadius:T.r100 }}>{t}</span>
          ))}
        </div>
        <p style={{ fontSize:13, color:T.mid, lineHeight:1.65, marginBottom:16 }}>Especializada em TCC com 8 anos de experiência. Atendo adultos e adolescentes.</p>
        {/* Time slots */}
        <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Horários — Terça-feira</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:18 }}>
          {[['09:00',true],['10:00',false],['14:00',false],['15:00',false]].map(([t,sel])=>(
            <span key={t as string} style={{ border:`2px solid ${sel?T.sage:T.nude}`, background:sel?T.sage:T.off, color:sel?'#fff':T.dark, borderRadius:T.r10, padding:'7px 13px', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>{t as string}</span>
          ))}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button style={{ flex:1, background:T.dark, color:T.cream, border:'none', borderRadius:T.r12, padding:'13px', fontSize:14, fontWeight:700, cursor:'pointer', transition:'background 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.background=T.sage} onMouseLeave={e=>e.currentTarget.style.background=T.dark}>
            Agendar consulta →
          </button>
          <button style={{ background:'#25D366', color:'white', border:'none', borderRadius:T.r12, padding:'13px 16px', fontSize:18, cursor:'pointer' }}>✉</button>
        </div>
      </div>
    </div>
  )
}

function PlanCard({ name, price, features, cta, href, featured, badge }: { name:string, price:string, features:string[], cta:string, href:string, featured:boolean, badge?:string }) {
  const [h,setH] = useState(false)
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:featured?T.dark:T.white, borderRadius:T.r24, padding:'32px 28px', border:featured?'none':`2px solid ${T.nude}`, outline:featured?`2px solid ${T.sage}`:'none', boxShadow:h?T.shadowXl:featured?T.shadowLg:T.shadowCard, position:'relative', overflow:'hidden', transition:'transform 0.2s, box-shadow 0.2s', transform:h?'translateY(-4px)':'none', textAlign:'left' }}>
      {badge && <div style={{ position:'absolute', top:16, right:16, background:T.sage, color:T.cream, fontSize:10, fontWeight:700, padding:'4px 12px', borderRadius:T.r100 }}>{badge}</div>}
      <p style={{ fontSize:12, fontWeight:700, color:featured?T.sageL:T.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>{name}</p>
      <div style={{ display:'flex', alignItems:'flex-end', gap:5, marginBottom:6 }}>
        <span style={{ fontFamily:T.fontSerif, fontSize:50, color:featured?T.cream:T.dark, lineHeight:1 }}>R${price}</span>
        <span style={{ fontSize:13, color:featured?'rgba(255,255,255,0.4)':T.muted, marginBottom:8 }}>/mês</span>
      </div>
      <hr style={{ border:'none', borderTop:`1px solid ${featured?'rgba(255,255,255,0.09)':T.nude}`, margin:'20px 0' }}/>
      <ul style={{ listStyle:'none', padding:0, margin:'0 0 26px', display:'flex', flexDirection:'column', gap:11 }}>
        {features.map(f=>(
          <li key={f} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:featured?'rgba(255,255,255,0.75)':T.mid, fontWeight:500 }}>
            <span style={{ width:18, height:18, borderRadius:'50%', background:featured?'rgba(168,196,173,0.18)':T.sageG, border:`1px solid ${featured?'rgba(168,196,173,0.3)':T.sageP}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:9, color:featured?T.sageL:T.sage, fontWeight:700 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link href={href} style={{ display:'block', textAlign:'center', padding:'13px', borderRadius:T.r12, fontSize:14, fontWeight:700, textDecoration:'none', background:featured?T.sage:'transparent', color:featured?T.cream:T.dark, border:featured?'none':`2px solid ${T.nude}`, transition:'all 0.2s' }}
        onMouseEnter={e=>{if(featured){e.currentTarget.style.background=T.sageL}else{e.currentTarget.style.background=T.sageG;e.currentTarget.style.borderColor=T.sage}}}
        onMouseLeave={e=>{if(featured){e.currentTarget.style.background=T.sage}else{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=T.nude}}}>
        {cta}
      </Link>
    </div>
  )
}

function BenefitCard({ e, t, d }: { e:string, t:string, d:string }) {
  const [h,setH] = useState(false)
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:T.white, borderRadius:T.r20, padding:'26px', border:`1px solid ${T.nude}`, boxShadow:h?T.shadowMd:T.shadowCard, transition:'transform 0.2s, box-shadow 0.2s', transform:h?'translateY(-3px)':'none' }}>
      <div style={{ width:44, height:44, borderRadius:T.r12, background:T.sageG, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:18 }}>{e}</div>
      <h3 style={{ fontWeight:700, fontSize:16, color:T.dark, marginBottom:8 }}>{t}</h3>
      <p style={{ fontSize:14, color:T.mid, lineHeight:1.65, margin:0 }}>{d}</p>
    </div>
  )
}
