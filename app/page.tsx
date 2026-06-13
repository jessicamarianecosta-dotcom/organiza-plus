'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowRight, Check, Star, Menu, X } from 'lucide-react'

const PROFESSIONS = [
  '🧠 Psicólogo','💊 Psiquiatra','🥗 Nutricionista','🦷 Dentista',
  '💆 Fisioterapeuta','⚕️ Médico','🌸 Esteticista','🧘 Terapeuta',
  '🎯 Coach','🏃 Ed. Físico','👁️ Oftalmologista','💉 Enfermeiro',
]

const STEPS = [
  { n:'01', icon:'✍️', title:'Crie sua conta', desc:'Cadastre-se em segundos e escolha sua profissão.' },
  { n:'02', icon:'🌐', title:'Página criada na hora', desc:'Link único gerado automaticamente para você.' },
  { n:'03', icon:'📅', title:'Configure horários', desc:'Defina os dias e horários que você atende.' },
  { n:'04', icon:'🔔', title:'Receba agendamentos', desc:'Clientes agendam e você recebe no painel e no WhatsApp.' },
]

const PLANS = [
  { name:'🌿 Basic', price:'27', features:['Página profissional','Link personalizado','Agendamento online','Integração WhatsApp','Responsivo mobile'], cta:'Começar Basic', href:'/cadastro?plano=basic', featured:false },
  { name:'💎 Premium', price:'47', features:['Tudo do Basic','Painel completo','Gestão de horários','8 temas de cores','Upload de fotos','Analytics completo','SEO básico'], cta:'Começar Premium →', href:'/cadastro?plano=premium', featured:true },
]

const TESTIMONIALS = [
  { emoji:'🧠', name:'Dra. Camila R.', role:'Psicóloga · São Paulo', text:'Reduzi em 90% o tempo respondendo mensagens. Meus clientes adoram a praticidade da minha página.' },
  { emoji:'🥗', name:'Fernanda M.', role:'Nutricionista · Curitiba', text:'Finalmente tenho uma página profissional linda sem pagar caro por um site. Recomendo demais!' },
  { emoji:'💆', name:'Rafael S.', role:'Fisioterapeuta · BH', text:'Recebi o aviso no WhatsApp na hora. Nunca mais perdi uma consulta por falta de comunicação.' },
]

const C = {
  sage:'#7A9E87', sageL:'#A8C4AD', sageP:'#D6E8DA', sageG:'#EAF3EC',
  dark:'#2C3530', mid:'#5A6660', muted:'#8A9690',
  cream:'#FAFAF7', off:'#F7F5F0', nude:'#EDE8E0',
  bege:'#C9B99A', begeP:'#F4EFE8', white:'#FFFFFF',
}

const S = {
  btn: { display:'inline-flex', alignItems:'center', gap:8, fontWeight:600, borderRadius:12, cursor:'pointer', transition:'all 0.2s', border:'none', textDecoration:'none', fontSize:15 } as React.CSSProperties,
  card: { background:C.white, borderRadius:20, border:`1px solid ${C.nude}`, boxShadow:'0 2px 12px rgba(44,53,48,0.06)' } as React.CSSProperties,
  section: { padding:'96px 24px' } as React.CSSProperties,
  inner: { maxWidth:1080, margin:'0 auto' } as React.CSSProperties,
  label: { display:'inline-flex', alignItems:'center', gap:8, background:C.sageG, border:`1px solid ${C.sageP}`, borderRadius:100, padding:'5px 14px', fontSize:12, fontWeight:600, color:C.sage, marginBottom:16 } as React.CSSProperties,
  h2: { fontFamily:'"DM Serif Display",Georgia,serif', fontSize:'clamp(28px,4vw,44px)', color:C.dark, lineHeight:1.15, marginBottom:12 } as React.CSSProperties,
  sub: { fontSize:17, color:C.mid, lineHeight:1.65, maxWidth:480, marginBottom:0 } as React.CSSProperties,
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div style={{ fontFamily:'"DM Sans",system-ui,sans-serif', background:C.cream, color:C.dark, overflowX:'hidden', WebkitFontSmoothing:'antialiased' }}>

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        padding:'0 24px', height:64,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background: scrolled ? 'rgba(250,250,247,0.92)' : 'rgba(250,250,247,0.7)',
        backdropFilter:'blur(20px)',
        borderBottom:`1px solid ${scrolled ? C.nude : 'transparent'}`,
        boxShadow: scrolled ? '0 4px 24px rgba(44,53,48,0.06)' : 'none',
        transition:'all 0.3s',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:C.sage }}/>
          <span style={{ fontFamily:'"DM Serif Display",Georgia,serif', fontSize:20, color:C.dark }}>
            Organiza<span style={{ color:C.sage }}>+</span>
          </span>
        </div>

        {/* Desktop links */}
        <div style={{ display:'flex', alignItems:'center', gap:32 }} className="hide-mobile">
          {[['#como-funciona','Como funciona'],['#funcionalidades','Funcionalidades'],['#planos','Planos']].map(([h,l])=>(
            <a key={h} href={h} style={{ fontSize:14, fontWeight:500, color:C.mid, textDecoration:'none', transition:'color 0.2s' }}
               onMouseEnter={e=>(e.target as HTMLElement).style.color=C.dark}
               onMouseLeave={e=>(e.target as HTMLElement).style.color=C.mid}>{l}</a>
          ))}
          <Link href="/login" style={{ fontSize:14, fontWeight:500, color:C.mid, textDecoration:'none' }}>Entrar</Link>
          <Link href="/cadastro" style={{ ...S.btn, background:C.dark, color:C.cream, padding:'10px 22px', fontSize:14 }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=C.sage}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background=C.dark}>
            Começar agora →
          </Link>
        </div>

        {/* Mobile */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }} className="show-mobile">
          <Link href="/login" style={{ fontSize:13, fontWeight:600, color:C.mid, textDecoration:'none' }}>Entrar</Link>
          <Link href="/cadastro" style={{ ...S.btn, background:C.dark, color:C.cream, padding:'8px 16px', fontSize:13 }}>
            Começar
          </Link>
          <button onClick={()=>setMobileMenu(!mobileMenu)} style={{ background:'none', border:'none', cursor:'pointer', color:C.dark, padding:4 }}>
            {mobileMenu ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div style={{ position:'fixed', top:64, left:0, right:0, zIndex:99, background:C.cream, borderBottom:`1px solid ${C.nude}`, padding:'16px 24px', display:'flex', flexDirection:'column', gap:4 }}>
          {[['#como-funciona','Como funciona'],['#funcionalidades','Funcionalidades'],['#planos','Planos']].map(([h,l])=>(
            <a key={h} href={h} onClick={()=>setMobileMenu(false)}
               style={{ padding:'12px 0', fontSize:15, fontWeight:500, color:C.dark, textDecoration:'none', borderBottom:`1px solid ${C.nude}` }}>{l}</a>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{
        minHeight:'100vh', paddingTop:128, paddingBottom:80, padding:'128px 24px 80px',
        display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
        background:`radial-gradient(ellipse 80% 50% at 50% -5%, rgba(122,158,135,0.16) 0%, transparent 65%), ${C.cream}`,
        position:'relative',
      }}>
        {/* Badge */}
        <div style={{ ...S.label, marginBottom:28 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:C.sage, display:'inline-block' }}/>
          Agendamento profissional simplificado
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily:'"DM Serif Display",Georgia,serif',
          fontSize:'clamp(36px,6vw,72px)', lineHeight:1.08,
          letterSpacing:'-0.02em', color:C.dark,
          maxWidth:760, marginBottom:20,
        }}>
          Tenha sua página profissional e receba agendamentos{' '}
          <em style={{ fontStyle:'italic', color:C.sage }}>online</em>{' '}
          automaticamente.
        </h1>

        {/* Sub */}
        <p style={{ fontSize:'clamp(16px,2vw,20px)', color:C.mid, maxWidth:520, lineHeight:1.65, marginBottom:40 }}>
          Organize sua agenda, compartilhe seu link e permita que clientes agendem em segundos — sem complicação.
        </p>

        {/* CTAs */}
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', marginBottom:40 }}>
          <Link href="/cadastro" style={{ ...S.btn, background:C.dark, color:C.cream, padding:'16px 36px', boxShadow:'0 8px 32px rgba(44,53,48,0.18)' }}
            onMouseEnter={e=>{e.currentTarget.style.background=C.sage; e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.dark; e.currentTarget.style.transform='translateY(0)'}}>
            ✦ Começar agora grátis
          </Link>
          <a href="#como-funciona" style={{ ...S.btn, background:'transparent', color:C.dark, padding:'16px 28px', border:`2px solid ${C.nude}` }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.sageL; e.currentTarget.style.background=C.sageG; e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.nude; e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateY(0)'}}>
            Ver como funciona <ArrowRight size={16}/>
          </a>
        </div>

        {/* Trust */}
        <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:13, color:C.muted, marginBottom:64 }}>
          <div style={{ display:'flex' }}>
            {['🧠','🌿','🦷','💆'].map((e,i)=>(
              <div key={i} style={{ width:32, height:32, borderRadius:'50%', border:`2px solid ${C.cream}`, background:C.sageP, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, marginLeft:i===0?0:-8 }}>{e}</div>
            ))}
          </div>
          <span>+1.200 profissionais já usam o Organiza+</span>
        </div>

        {/* ── DASHBOARD MOCKUP ── */}
        <div style={{ width:'100%', maxWidth:900, position:'relative' }}>
          {/* Floating cards */}
          <div style={{ position:'absolute', left:-20, bottom:60, background:C.white, borderRadius:16, padding:'12px 16px', boxShadow:'0 8px 32px rgba(44,53,48,0.12)', border:`1px solid ${C.nude}`, display:'flex', alignItems:'center', gap:10, zIndex:2, animation:'floatUp 3s ease-in-out infinite' }} className="hide-mobile">
            <span style={{ fontSize:22 }}>📅</span>
            <div>
              <div style={{ fontSize:10, color:C.muted, fontWeight:600 }}>HOJE</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.dark }}>8 agendamentos</div>
            </div>
          </div>
          <div style={{ position:'absolute', right:-20, top:60, background:C.white, borderRadius:16, padding:'12px 16px', boxShadow:'0 8px 32px rgba(44,53,48,0.12)', border:`1px solid ${C.nude}`, display:'flex', alignItems:'center', gap:10, zIndex:2, animation:'floatDown 4s ease-in-out infinite' }} className="hide-mobile">
            <div style={{ width:36, height:36, borderRadius:10, background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:18 }}>✓</div>
            <div>
              <div style={{ fontSize:10, color:C.muted, fontWeight:600 }}>WHATSAPP</div>
              <div style={{ fontSize:14, fontWeight:700, color:C.dark }}>Novo cliente!</div>
            </div>
          </div>

          {/* Browser window */}
          <div style={{ borderRadius:20, overflow:'hidden', boxShadow:'0 24px 80px rgba(44,53,48,0.16), 0 0 0 1px rgba(200,195,185,0.3)', background:C.white }}>
            {/* Browser bar */}
            <div style={{ background:C.off, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${C.nude}` }}>
              <div style={{ display:'flex', gap:5 }}>
                {['#ff6b6b','#ffd166',C.sageL].map(c=><div key={c} style={{ width:12, height:12, borderRadius:'50%', background:c }}/>)}
              </div>
              <div style={{ flex:1, background:C.nude, borderRadius:6, padding:'5px 12px', fontSize:11, color:C.muted, display:'flex', alignItems:'center', gap:5 }}>
                🔒 organizamais.com/dashboard
              </div>
            </div>

            {/* Dashboard */}
            <div style={{ display:'flex', minHeight:380 }}>
              {/* Sidebar */}
              <div style={{ width:200, background:C.dark, padding:'20px 0', display:'flex', flexDirection:'column', gap:2, flexShrink:0 }} className="hide-small">
                <div style={{ fontFamily:'"DM Serif Display",Georgia,serif', fontSize:18, color:C.cream, padding:'0 20px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:8 }}>
                  Organiza<span style={{ color:C.sageL }}>+</span>
                </div>
                {[['📊','Dashboard',true],['📅','Agenda',false],['👥','Clientes',false],['🌐','Minha página',false],['⚙️','Config.',false]].map(([ic,lb,ac])=>(
                  <div key={lb as string} style={{ display:'flex', alignItems:'center', gap:10, margin:'0 10px', padding:'9px 12px', borderRadius:10, fontSize:13, fontWeight:500, background:ac?'rgba(122,158,135,0.2)':'transparent', color:ac?C.sageL:'rgba(255,255,255,0.35)' }}>
                    {ic} {lb}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div style={{ flex:1, background:C.off, padding:24, minWidth:0 }}>
                {/* Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:15, color:C.dark, margin:0 }}>Olá, Dra. Ana 👋</p>
                    <p style={{ fontSize:12, color:C.muted, margin:'3px 0 0' }}>Sexta-feira, 13 de junho de 2025</p>
                  </div>
                  <span style={{ background:C.sageG, color:C.sage, fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:100, border:`1px solid ${C.sageP}` }}>✦ Premium</span>
                </div>

                {/* Stat cards */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
                  {[['Hoje','8','↑ +3 vs ontem'],['Clientes','42','↑ +12 novos'],['Pendentes','3','⏳ Aprovar']].map(([l,v,s])=>(
                    <div key={l} style={{ background:C.white, borderRadius:14, padding:'14px 16px', border:`1px solid ${C.nude}`, boxShadow:'0 2px 8px rgba(44,53,48,0.05)' }}>
                      <p style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.07em', margin:0 }}>{l}</p>
                      <p style={{ fontSize:26, fontWeight:800, color:C.dark, margin:'5px 0 2px' }}>{v}</p>
                      <p style={{ fontSize:11, color:C.sage, margin:0, fontWeight:500 }}>{s}</p>
                    </div>
                  ))}
                </div>

                {/* Appointments */}
                <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.nude}`, overflow:'hidden' }}>
                  <div style={{ padding:'11px 16px', borderBottom:`1px solid ${C.nude}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:C.dark }}>Próximos agendamentos</span>
                    <span style={{ fontSize:10, fontWeight:700, color:C.sage, background:C.sageG, padding:'3px 10px', borderRadius:100 }}>Hoje</span>
                  </div>
                  {[['09:00','Mariana S.','Consulta inicial',true],['10:30','Carlos M.','Retorno',true],['14:00','Laura P.','Avaliação',false]].map(([t,n,tp,ok])=>(
                    <div key={n as string} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderBottom:`1px solid rgba(237,232,224,0.5)` }}>
                      <div style={{ background:C.sageG, color:C.sage, fontSize:11, fontWeight:700, padding:'5px 9px', borderRadius:8, flexShrink:0 }}>{t}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:12, fontWeight:600, color:C.dark, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n as string}</p>
                        <p style={{ fontSize:11, color:C.muted, margin:0 }}>{tp as string}</p>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:100, flexShrink:0, background:ok?'rgba(122,158,135,0.12)':'rgba(251,191,36,0.15)', color:ok?C.sage:'#d97706' }}>
                        {ok?'Confirmado':'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFISSÕES ── */}
      <div style={{ padding:'40px 24px', background:C.white, borderTop:`1px solid ${C.nude}`, borderBottom:`1px solid ${C.nude}`, textAlign:'center' }}>
        <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:20 }}>
          Para todos os profissionais de saúde e bem-estar
        </p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', maxWidth:700, margin:'0 auto' }}>
          {PROFESSIONS.map(p=>(
            <span key={p} style={{ background:C.off, border:`1px solid ${C.nude}`, borderRadius:100, padding:'7px 16px', fontSize:13, color:C.mid, fontWeight:500, cursor:'default', transition:'all 0.2s' }}
              onMouseEnter={e=>{(e.target as HTMLElement).style.borderColor=C.sageL;(e.target as HTMLElement).style.color=C.sage;(e.target as HTMLElement).style.background=C.sageG}}
              onMouseLeave={e=>{(e.target as HTMLElement).style.borderColor=C.nude;(e.target as HTMLElement).style.color=C.mid;(e.target as HTMLElement).style.background=C.off}}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{ ...S.section, background:C.off }}>
        <div style={S.inner}>
          <div style={S.label}>✦ Como funciona</div>
          <h2 style={{ ...S.h2, maxWidth:560 }}>Em minutos, sua página profissional está <em style={{ color:C.sage, fontStyle:'italic' }}>no ar.</em></h2>
          <p style={{ ...S.sub, marginBottom:56 }}>Sem designer, sem site caro. O Organiza+ faz tudo automaticamente.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20 }}>
            {STEPS.map(s=>(
              <div key={s.n} style={{ ...S.card, padding:'28px 24px', position:'relative', overflow:'hidden', transition:'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(44,53,48,0.10)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 12px rgba(44,53,48,0.06)'}}>
                <div style={{ fontFamily:'"DM Serif Display",Georgia,serif', fontSize:48, color:'rgba(122,158,135,0.12)', position:'absolute', top:12, right:16, lineHeight:1 }}>{s.n}</div>
                <div style={{ width:48, height:48, background:C.sageG, border:`1px solid ${C.sageP}`, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:18 }}>{s.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:700, color:C.dark, marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:14, color:C.mid, lineHeight:1.6, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PÁGINA PÚBLICA ── */}
      <section style={{ ...S.section, background:`linear-gradient(135deg, ${C.sageG} 0%, ${C.begeP} 100%)` }}>
        <div style={{ ...S.inner }}>
          <div style={S.label}>🌐 Sua página profissional</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }} className="grid-responsive">
            <div>
              <h2 style={{ ...S.h2 }}>Uma página elegante que representa você com <em style={{ color:C.sage, fontStyle:'italic' }}>sofisticação.</em></h2>
              <p style={{ ...S.sub, marginBottom:32 }}>Cada profissional recebe uma página personalizada, responsiva e pronta para receber clientes.</p>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  {icon:'🔗', t:'Link personalizado', d:'organizamais.com/seu-nome — compartilhe nas redes.'},
                  {icon:'📱', t:'100% responsiva', d:'Funciona perfeitamente em qualquer dispositivo.'},
                  {icon:'⚡', t:'Agendamento em 30s', d:'O cliente agenda sem precisar ligar ou enviar mensagem.'},
                  {icon:'💬', t:'Notificação WhatsApp', d:'Você recebe os dados do cliente instantaneamente.'},
                ].map(f=>(
                  <div key={f.t} style={{ display:'flex', gap:14, background:C.white, borderRadius:16, padding:'16px 18px', boxShadow:'0 2px 8px rgba(44,53,48,0.05)', transition:'transform 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateX(4px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='translateX(0)'}>
                    <div style={{ width:42, height:42, background:C.sageG, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{f.icon}</div>
                    <div>
                      <p style={{ fontWeight:700, fontSize:14, color:C.dark, margin:'0 0 3px' }}>{f.t}</p>
                      <p style={{ fontSize:13, color:C.mid, margin:0 }}>{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Profile card */}
            <div style={{ background:C.white, borderRadius:28, boxShadow:'0 20px 60px rgba(44,53,48,0.12)', overflow:'hidden' }}>
              <div style={{ padding:'32px 28px 24px', background:`linear-gradient(135deg, ${C.dark} 0%, #3d4f47 100%)` }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background:C.sageP, border:'3px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, marginBottom:14 }}>👩‍⚕️</div>
                <h3 style={{ fontFamily:'"DM Serif Display",Georgia,serif', fontSize:22, color:C.cream, margin:'0 0 4px' }}>Dra. Ana Beatriz</h3>
                <p style={{ fontSize:13, color:C.sageL, margin:'0 0 4px', fontWeight:500 }}>Psicóloga Clínica — CRP 06/12345</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', margin:0 }}>📍 São Paulo, SP · Online e presencial</p>
              </div>
              <div style={{ padding:'20px 24px' }}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:16 }}>
                  {['Ansiedade','Depressão','TCC','Relacionamentos'].map(t=>(
                    <span key={t} style={{ background:C.sageG, border:`1px solid ${C.sageP}`, color:C.sage, fontSize:11, fontWeight:600, padding:'4px 11px', borderRadius:100 }}>{t}</span>
                  ))}
                </div>
                <p style={{ fontSize:13, color:C.mid, lineHeight:1.6, marginBottom:16 }}>Especializada em TCC com 8 anos de experiência. Atendo adultos e adolescentes com foco em ansiedade e autoconhecimento.</p>
                <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Horários — Terça</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:18 }}>
                  {['09:00','10:00','14:00','15:00'].map((t,i)=>(
                    <span key={t} style={{ border:`2px solid ${i===0?C.sage:C.nude}`, background:i===0?C.sage:C.off, color:i===0?C.white:C.dark, borderRadius:10, padding:'7px 13px', fontSize:13, fontWeight:600, cursor:'pointer' }}>{t}</span>
                  ))}
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button style={{ flex:1, background:C.dark, color:C.cream, border:'none', borderRadius:12, padding:'13px', fontSize:14, fontWeight:600, cursor:'pointer', transition:'background 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.background=C.sage}
                    onMouseLeave={e=>e.currentTarget.style.background=C.dark}>
                    Agendar consulta →
                  </button>
                  <button style={{ background:'#25D366', color:'white', border:'none', borderRadius:12, padding:'13px 16px', fontSize:18, cursor:'pointer' }}>✉</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section id="funcionalidades" style={{ ...S.section, background:C.dark }}>
        <div style={S.inner}>
          <div style={{ ...S.label, background:'rgba(122,158,135,0.15)', borderColor:'rgba(122,158,135,0.2)', color:C.sageL }}>✦ Funcionalidades</div>
          <h2 style={{ ...S.h2, color:C.cream, maxWidth:600 }}>Tudo que você precisa para <em style={{ color:C.sageL, fontStyle:'italic' }}>organizar e crescer</em> sua agenda.</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:16, marginTop:52 }}>
            {[
              {icon:'📊', t:'Dashboard completo', d:'Agendamentos, clientes e métricas em um painel moderno e intuitivo.'},
              {icon:'🗓️', t:'Gestão de horários', d:'Defina disponibilidade, bloqueie datas e gerencie sua agenda.'},
              {icon:'🌐', t:'Página automática', d:'Gerada ao criar a conta — elegante e pronta para compartilhar.'},
              {icon:'💬', t:'WhatsApp automático', d:'Notificação instantânea com todos os dados do agendamento.'},
              {icon:'👤', t:'Perfil personalizável', d:'8 temas de cores, foto, bio e especialidades.'},
              {icon:'🔒', t:'Multi-usuário seguro', d:'Cada conta é isolada e protegida com RLS.'},
            ].map(f=>(
              <div key={f.t} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'28px', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(122,158,135,0.1)';e.currentTarget.style.borderColor='rgba(122,158,135,0.2)';e.currentTarget.style.transform='translateY(-3px)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='translateY(0)'}}>
                <div style={{ fontSize:24, marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:C.cream, marginBottom:8 }}>{f.t}</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.65, margin:0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" style={{ ...S.section, background:C.begeP }}>
        <div style={{ ...S.inner, textAlign:'center' }}>
          <div style={{ ...S.label, margin:'0 auto 16px' }}>💰 Planos</div>
          <h2 style={{ ...S.h2, margin:'0 auto 12px' }}>Simples, transparente e <em style={{ color:C.sage, fontStyle:'italic' }}>acessível.</em></h2>
          <p style={{ ...S.sub, margin:'0 auto 52px' }}>Sem surpresas. Cancele quando quiser. Comece em minutos.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24, maxWidth:700, margin:'0 auto' }}>
            {PLANS.map(p=>(
              <div key={p.name} style={{ background:p.featured?C.dark:C.white, borderRadius:28, padding:'36px 32px', border:p.featured?'none':'2px solid #EDE8E0', boxShadow:p.featured?'0 20px 60px rgba(44,53,48,0.14)':'0 4px 20px rgba(44,53,48,0.06)', position:'relative', outline:p.featured?`2px solid ${C.sage}`:'none', transition:'transform 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                {p.featured && <div style={{ position:'absolute', top:16, right:16, background:C.sage, color:C.cream, fontSize:10, fontWeight:700, padding:'4px 12px', borderRadius:100 }}>Mais popular</div>}
                <p style={{ fontSize:12, fontWeight:700, color:p.featured?C.sageL:C.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>{p.name}</p>
                <div style={{ fontFamily:'"DM Serif Display",Georgia,serif', fontSize:52, color:p.featured?C.cream:C.dark, lineHeight:1 }}>R${p.price}</div>
                <p style={{ fontSize:14, color:p.featured?'rgba(255,255,255,0.4)':C.muted, marginBottom:24 }}>por mês</p>
                <hr style={{ border:'none', borderTop:`1px solid ${p.featured?'rgba(255,255,255,0.08)':C.nude}`, marginBottom:24 }}/>
                <ul style={{ listStyle:'none', padding:0, margin:'0 0 28px', display:'flex', flexDirection:'column', gap:12 }}>
                  {p.features.map(f=>(
                    <li key={f} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:p.featured?'rgba(255,255,255,0.7)':C.mid, fontWeight:500 }}>
                      <Check size={15} color={p.featured?C.sageL:C.sage} style={{ flexShrink:0 }}/>{f}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} style={{ display:'block', textAlign:'center', padding:'14px', borderRadius:12, fontSize:15, fontWeight:600, textDecoration:'none', background:p.featured?C.sage:'transparent', color:p.featured?C.cream:C.dark, border:p.featured?'none':`2px solid ${C.nude}`, transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background=p.featured?C.sageL:C.sageG;e.currentTarget.style.borderColor=p.featured?C.sageL:C.sage}}
                  onMouseLeave={e=>{e.currentTarget.style.background=p.featured?C.sage:'transparent';e.currentTarget.style.borderColor=p.featured?'transparent':C.nude}}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section style={{ ...S.section, background:C.cream }}>
        <div style={S.inner}>
          <div style={S.label}>💬 Depoimentos</div>
          <h2 style={{ ...S.h2, marginBottom:52 }}>Quem usa, <em style={{ color:C.sage, fontStyle:'italic' }}>ama.</em></h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {TESTIMONIALS.map(t=>(
              <div key={t.name} style={{ ...S.card, padding:'28px', transition:'transform 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ display:'flex', gap:2, marginBottom:14 }}>
                  {"★★★★★"}
                </div>
                <p style={{ fontSize:15, color:C.mid, lineHeight:1.65, fontStyle:'italic', marginBottom:20 }}>"{t.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:C.sageP, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{t.emoji}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:14, color:C.dark, margin:0 }}>{t.name}</p>
                    <p style={{ fontSize:12, color:C.muted, margin:0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding:'100px 24px', background:C.dark, textAlign:'center', backgroundImage:'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(122,158,135,0.12) 0%, transparent 70%)' }}>
        <h2 style={{ fontFamily:'"DM Serif Display",Georgia,serif', fontSize:'clamp(32px,5vw,56px)', color:C.cream, lineHeight:1.15, maxWidth:620, margin:'0 auto 16px' }}>
          Pronto para transformar sua <em style={{ color:C.sageL, fontStyle:'italic' }}>agenda profissional?</em>
        </h2>
        <p style={{ fontSize:17, color:'rgba(255,255,255,0.5)', maxWidth:420, margin:'0 auto 40px' }}>
          Sua página profissional no ar em menos de 5 minutos.
        </p>
        <Link href="/cadastro" style={{ ...S.btn, background:C.sage, color:C.cream, padding:'18px 44px', fontSize:16, boxShadow:'0 12px 40px rgba(122,158,135,0.3)' }}
          onMouseEnter={e=>{e.currentTarget.style.background=C.sageL;e.currentTarget.style.transform='translateY(-2px)'}}
          onMouseLeave={e=>{e.currentTarget.style.background=C.sage;e.currentTarget.style.transform='translateY(0)'}}>
          ✦ Começar agora — é grátis <ArrowRight size={18}/>
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:C.dark, borderTop:'1px solid rgba(255,255,255,0.06)', padding:'36px 24px', textAlign:'center' }}>
        <div style={{ fontFamily:'"DM Serif Display",Georgia,serif', fontSize:18, color:'rgba(255,255,255,0.2)', marginBottom:6 }}>
          Organiza<span style={{ color:'rgba(122,158,135,0.4)' }}>+</span>
        </div>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', margin:0 }}>© 2025 Organiza+. Feito com 💚 para profissionais modernos.</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        .hide-mobile { display: flex !important; }
        .show-mobile { display: none !important; }
        .hide-small { display: flex !important; }
        .grid-responsive { grid-template-columns: 1fr 1fr !important; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .hide-small { display: none !important; }
          .grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
