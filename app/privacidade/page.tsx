'use client'
import Link from 'next/link'
import { T, GlobalStyles } from '@/lib/ds'
import { ArrowLeft } from 'lucide-react'

export default function Privacidade() {
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
        <h1 style={{ fontFamily:T.fontSerif, fontSize:36, color:T.dark, marginBottom:8 }}>Política de Privacidade</h1>
        <p style={{ fontSize:13, color:T.muted, marginBottom:40 }}>Última atualização: 22 de junho de 2026 · Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</p>

        <div style={{ display:'flex', flexDirection:'column', gap:32, fontSize:15, lineHeight:1.75, color:T.mid }}>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>1. Introdução</h2>
            <p>Esta Política de Privacidade descreve como o Organiza+ coleta, usa, armazena e protege os dados pessoais de profissionais cadastrados na plataforma e de seus respectivos clientes/pacientes.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>2. Dados que Coletamos</h2>
            <p style={{ marginBottom:10 }}><strong style={{ color:T.dark }}>Do profissional cadastrado:</strong></p>
            <ul style={{ paddingLeft:20, marginBottom:14, display:'flex', flexDirection:'column', gap:6 }}>
              <li>Nome completo, e-mail e senha (criptografada)</li>
              <li>Profissão, especialidades, registro profissional (CRP/CRM/CRO etc.)</li>
              <li>Foto de perfil, biografia, cidade, WhatsApp e redes sociais</li>
              <li>Dados de pagamento (processados diretamente pelo Stripe — não armazenamos números de cartão)</li>
              <li>Horários de atendimento e configurações da agenda</li>
            </ul>
            <p style={{ marginBottom:10 }}><strong style={{ color:T.dark }}>Dos clientes/pacientes que agendam consultas:</strong></p>
            <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
              <li>Nome, telefone e e-mail (quando fornecido)</li>
              <li>Data, horário e observações do agendamento</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>3. Finalidade do Tratamento</h2>
            <p style={{ marginBottom:10 }}>Utilizamos os dados coletados para:</p>
            <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
              <li>Criar e manter sua conta e página profissional pública</li>
              <li>Processar agendamentos entre profissionais e seus clientes</li>
              <li>Enviar notificações por e-mail e WhatsApp relacionadas a agendamentos</li>
              <li>Processar pagamentos de assinatura</li>
              <li>Melhorar a plataforma e fornecer suporte técnico</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>4. Base Legal</h2>
            <p>O tratamento de dados pessoais no Organiza+ se fundamenta na execução de contrato (Art. 7º, V da LGPD) para a prestação do serviço de agendamento, e no consentimento do titular quando aplicável. Para os dados de pacientes inseridos por profissionais de saúde, o profissional atua como controlador desses dados, sendo responsável por garantir base legal adequada.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>5. Compartilhamento de Dados</h2>
            <p style={{ marginBottom:10 }}>Não vendemos seus dados pessoais. Compartilhamos dados apenas com:</p>
            <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
              <li><strong style={{ color:T.dark }}>Supabase</strong> — infraestrutura de banco de dados e autenticação</li>
              <li><strong style={{ color:T.dark }}>Stripe</strong> — processamento de pagamentos</li>
              <li><strong style={{ color:T.dark }}>Resend</strong> — envio de e-mails transacionais</li>
              <li><strong style={{ color:T.dark }}>Vercel</strong> — hospedagem da aplicação</li>
              <li>Autoridades competentes, quando exigido por lei ou ordem judicial</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>6. Armazenamento e Segurança</h2>
            <p>Seus dados são armazenados em servidores seguros do Supabase, com criptografia em trânsito (HTTPS/TLS) e controle de acesso via Row Level Security (RLS), garantindo que cada usuário só acesse seus próprios dados e os de sua agenda.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>7. Seus Direitos (LGPD)</h2>
            <p style={{ marginBottom:10 }}>Como titular de dados, você tem direito a:</p>
            <ul style={{ paddingLeft:20, display:'flex', flexDirection:'column', gap:6 }}>
              <li>Confirmação da existência de tratamento de dados</li>
              <li>Acesso aos seus dados</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço</li>
              <li>Eliminação dos dados tratados com seu consentimento</li>
              <li>Revogação do consentimento, quando aplicável</li>
            </ul>
            <p style={{ marginTop:10 }}>Para exercer qualquer desses direitos, entre em contato através do e-mail de suporte disponibilizado na plataforma.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>8. Retenção de Dados</h2>
            <p>Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir sua conta, seus dados são removidos de nossa base em até 30 dias, exceto quando a retenção for exigida por obrigação legal.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>9. Cookies</h2>
            <p>Utilizamos cookies essenciais para autenticação e funcionamento da plataforma. Não utilizamos cookies de rastreamento publicitário de terceiros.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>10. Alterações nesta Política</h2>
            <p>Esta Política pode ser atualizada periodicamente. Notificaremos sobre alterações significativas através de e-mail ou aviso na plataforma.</p>
          </section>

          <section>
            <h2 style={{ fontFamily:T.fontSerif, fontSize:20, color:T.dark, marginBottom:10 }}>11. Contato e Encarregado de Dados</h2>
            <p>Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de seus dados pessoais, entre em contato através do e-mail de suporte disponibilizado na plataforma.</p>
          </section>

        </div>
      </div>
    </div>
  )
}
