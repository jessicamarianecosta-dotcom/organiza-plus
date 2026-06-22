'use client'
import Link from 'next/link'
import { T, GlobalStyles } from '@/lib/ds'
import { ArrowLeft } from 'lucide-react'

export default function Termos() {
  return (
    <div style={{ minHeight:'100vh', background:T.off, fontFamily:T.fontSans, color:T.dark }}>
      <GlobalStyles/>
      <div style={{ background:T.white, borderBottom:`1px solid ${T.nude}`, padding:'0 24px' }}>
        <div style={{ maxWidth:760, margin:'0 auto', height:64, display:'flex', alignItems:'center', gap:16 }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:T.muted, textDecoration:'none' }}>
            <ArrowLeft size={15}/> Início
          </Link>
          <span style={{ color:T.nude }}>|</span>
          <span style={{ fontFamily:T.fontSerif, fontSize:18, color:T.dark }}>Organiza<span style={{ color:T.sage }}>+</span></span>
        </div>
      </div>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'48px 24px 80px' }}>
        <h1 style={{ fontFamily:T.fontSerif, fontSize:36, color:T.dark, marginBottom:8 }}>Termos de Uso</h1>
        <p style={{ fontSize:13, color:T.muted, marginBottom:40 }}>Última atualização: 22 de junho de 2026</p>

        <div style={{ display:'flex', flexDirection:'column', gap:32, fontSize:15, lineHeight:1.75, color:T.mid }}>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>1. Sobre o Organiza+</h2>
            <p>O Organiza+ é uma plataforma de software como serviço (SaaS) que oferece páginas profissionais e ferramentas de agendamento online para profissionais de saúde e bem-estar, incluindo mas não se limitando a psicólogos, nutricionistas, dentistas, fisioterapeutas, médicos, terapeutas, coaches e esteticistas.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>2. Aceitação dos Termos</h2>
            <p>Ao criar uma conta no Organiza+, você concorda integralmente com estes Termos de Uso e com nossa Política de Privacidade. Se você não concorda com algum destes termos, não deve utilizar a plataforma.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>3. Cadastro e Conta</h2>
            <p style={{ marginBottom:10 }}>Para utilizar o Organiza+, você deve fornecer informações verdadeiras, completas e atualizadas durante o cadastro. Você é responsável por:</p>
            <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
              <li>Manter a confidencialidade de sua senha e dados de acesso</li>
              <li>Todas as atividades realizadas em sua conta</li>
              <li>Notificar imediatamente qualquer uso não autorizado de sua conta</li>
              <li>Garantir que as informações profissionais fornecidas (CRP, CRM, CRO etc.) são verdadeiras e válidas</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>4. Responsabilidade Profissional</h2>
            <p>O Organiza+ é uma ferramenta de tecnologia para agendamento e apresentação profissional. Não somos responsáveis pela qualidade, adequação, legalidade ou resultado dos serviços profissionais prestados pelos usuários cadastrados em nossa plataforma. A relação entre o profissional e seus clientes/pacientes é de exclusiva responsabilidade das partes envolvidas.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>5. Planos e Pagamentos</h2>
            <p style={{ marginBottom:10 }}>O Organiza+ oferece planos de assinatura mensal (Basic e Premium) processados através da plataforma de pagamentos Stripe. Ao assinar um plano, você concorda que:</p>
            <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
              <li>A cobrança é recorrente e automática até o cancelamento</li>
              <li>Você pode cancelar sua assinatura a qualquer momento através do painel ou solicitando por e-mail</li>
              <li>Não há reembolso proporcional de períodos já pagos, exceto quando exigido por lei</li>
              <li>Os preços podem ser alterados mediante aviso prévio de 30 dias</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>6. Conteúdo do Usuário</h2>
            <p>Você é o único responsável pelo conteúdo que publica em sua página pública (textos, fotos, especialidades, informações de contato). O Organiza+ reserva-se o direito de remover conteúdo que viole leis, direitos de terceiros ou estes Termos, sem aviso prévio.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>7. Dados de Clientes/Pacientes</h2>
            <p>Ao utilizar o sistema de agendamento, você coletará dados pessoais de seus clientes/pacientes (nome, telefone, e-mail). Você é responsável, na qualidade de controlador desses dados perante a Lei Geral de Proteção de Dados (LGPD), por garantir que possui base legal adequada para tratá-los e por respeitar os direitos desses titulares.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>8. Disponibilidade do Serviço</h2>
            <p>Nos esforçamos para manter o Organiza+ disponível ininterruptamente, mas não garantimos disponibilidade de 100%. Manutenções programadas ou falhas técnicas podem causar indisponibilidade temporária, pelas quais não nos responsabilizamos por eventuais perdas.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>9. Cancelamento e Encerramento</h2>
            <p>Você pode encerrar sua conta a qualquer momento. Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos, pratiquem atividades fraudulentas ou ilegais, ou apresentem informações falsas no cadastro.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>10. Alterações nos Termos</h2>
            <p>Estes Termos podem ser atualizados periodicamente. Alterações significativas serão comunicadas por e-mail ou aviso na plataforma com antecedência razoável.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>11. Contato</h2>
            <p>Para dúvidas sobre estes Termos de Uso, entre em contato através do e-mail de suporte disponibilizado na plataforma.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
