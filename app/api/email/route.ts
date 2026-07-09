import { NextRequest, NextResponse } from 'next/server'

const KEY  = process.env.RESEND_API_KEY
const FROM = 'Organiza+ <noreply@organizaplusapp.com.br>'

// ── Resend send ────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  if (!KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping send')
    return { ok: false, error: 'RESEND_API_KEY not configured' }
  }

  const payload = { from: FROM, to, subject, html }
  console.log('[email] Sending to Resend:', { to, subject, from: FROM })

  let res: Response
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify(payload),
    })
  } catch (networkErr) {
    console.error('[email] Network error calling Resend:', networkErr)
    return { ok: false, error: `Network error: ${String(networkErr)}` }
  }

  const data = await res.json()

  if (!res.ok) {
    console.error('[email] Resend error:', JSON.stringify(data))
    return { ok: false, error: JSON.stringify(data), data }
  }

  console.log('[email] Resend success:', JSON.stringify(data))
  return { ok: true, data }
}

// ── Notification log (direct REST — no cookie auth needed) ─────────────────
async function logNotification(entry: {
  appointment_id?: string | null
  professional_id?: string | null
  recipient: string
  event_type: string
  status: 'sent' | 'failed' | 'skipped'
  error_message?: string | null
}) {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const akey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !akey) return

  try {
    const res = await fetch(`${url}/rest/v1/notification_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': akey,
        'Authorization': `Bearer ${akey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        appointment_id: entry.appointment_id || null,
        professional_id: entry.professional_id || null,
        channel: 'email',
        recipient: entry.recipient,
        event_type: entry.event_type,
        status: entry.status,
        error_message: entry.error_message || null,
        metadata: {},
      }),
    })
    if (!res.ok) {
      const errBody = await res.text()
      console.warn('[email] notification_logs insert failed:', res.status, errBody)
    } else {
      console.log('[email] notification_logs insert ok — event:', entry.event_type, 'status:', entry.status)
    }
  } catch (e) {
    console.warn('[email] notification_logs error (non-fatal):', e)
  }
}

// ── Templates ──────────────────────────────────────────────────────────────
function wrap(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;background:#F7F5F0;margin:0;padding:24px 16px">
  <div style="max-width:520px;margin:0 auto">
    <div style="background:#2C3530;border-radius:20px 20px 0 0;padding:24px 32px;text-align:center">
      <span style="font-size:20px;color:#FAFAF7;font-weight:700;letter-spacing:-0.02em">Organiza<span style="color:#A8C4AD">+</span></span>
    </div>
    <div style="background:#ffffff;padding:32px;border:1px solid #EDE8E0;border-top:none">
      ${content}
    </div>
    <div style="background:#EDE8E0;border-radius:0 0 20px 20px;padding:14px;text-align:center">
      <p style="color:#8A9690;font-size:11px;margin:0">© 2025 Organiza+ · Todos os direitos reservados</p>
    </div>
  </div>
</body></html>`
}

function card(rows: { label: string; value: string }[]) {
  return `<div style="background:#EAF3EC;border-radius:14px;padding:18px 20px;margin:16px 0">
    ${rows.map(r => `<p style="margin:0 0 7px;color:#2C3530;font-size:14px"><strong>${r.label}</strong> ${r.value}</p>`).join('')}
  </div>`
}

const templates: Record<string, (d: any) => { subject: string; html: string }> = {

  // Sent to client right after booking (status = pending)
  booking_received: (d) => ({
    subject: '📋 Agendamento recebido — aguardando confirmação',
    html: wrap(`
      <h2 style="color:#2C3530;margin:0 0 6px;font-size:21px">Solicitação recebida! 📋</h2>
      <p style="color:#5A6660;margin:0 0 4px;font-size:15px">Olá, <strong>${d.client}</strong>!</p>
      <p style="color:#5A6660;margin:0 0 16px;font-size:15px">Sua solicitação de agendamento foi recebida e está aguardando confirmação do profissional.</p>
      ${card([
        { label: '👨‍⚕️ Profissional:', value: d.professional },
        { label: '📅 Data:', value: d.date },
        { label: '🕐 Horário:', value: d.time },
        ...(d.modality ? [{ label: '📍 Modalidade:', value: d.modality }] : []),
        ...(d.price ? [{ label: '💰 Valor:', value: d.price }] : []),
      ])}
      <div style="background:#FFF8E6;border:1px solid #F5D878;border-radius:12px;padding:14px 18px;margin:16px 0">
        <p style="color:#92700A;font-size:13px;margin:0;line-height:1.6">⏳ <strong>Status: Aguardando confirmação.</strong> Você receberá um e-mail assim que o profissional confirmar sua consulta.</p>
      </div>
      <p style="color:#8A9690;font-size:13px;margin:12px 0 0;line-height:1.6">Em caso de dúvidas, entre em contato diretamente com o profissional.</p>
    `),
  }),

  // Sent to client when professional confirms
  appointment_confirmed: (d) => ({
    subject: '✅ Consulta confirmada!',
    html: wrap(`
      <h2 style="color:#2C3530;margin:0 0 6px;font-size:21px">Consulta confirmada! ✅</h2>
      <p style="color:#5A6660;margin:0 0 4px;font-size:15px">Olá, <strong>${d.client}</strong>!</p>
      <p style="color:#5A6660;margin:0 0 16px;font-size:15px"><strong>${d.professional}</strong> confirmou sua consulta. Anote os detalhes:</p>
      ${card([
        { label: '👨‍⚕️ Profissional:', value: d.professional },
        { label: '📅 Data:', value: d.date },
        { label: '🕐 Horário:', value: d.time },
        { label: '📍 Modalidade:', value: d.modality || 'A combinar' },
        ...(d.price ? [{ label: '💰 Valor:', value: d.price }] : []),
        ...(d.location ? [{ label: '🏠 Local / Link:', value: d.location }] : []),
      ])}
      <div style="background:#EAF3EC;border-radius:12px;padding:14px 18px;margin:16px 0">
        <p style="color:#2C5F3A;font-size:13px;margin:0 0 8px;font-weight:700">📌 Lembre-se:</p>
        <p style="color:#3A6647;font-size:13px;margin:0;line-height:1.7">• Confirme sua presença com antecedência<br>• Em caso de imprevisto, avise com pelo menos 24h de antecedência<br>• Chegue com alguns minutos de antecedência</p>
      </div>
      <p style="color:#8A9690;font-size:13px;margin:12px 0 0;line-height:1.6">Para cancelar ou reagendar, entre em contato diretamente com o profissional.</p>
    `),
  }),

  // Sent to professional when new patient books
  new_booking: (d) => ({
    subject: '📅 Novo agendamento recebido',
    html: wrap(`
      <h2 style="color:#2C3530;margin:0 0 6px;font-size:21px">Novo agendamento! 📅</h2>
      <p style="color:#5A6660;margin:0 0 16px;font-size:15px">Você recebeu um novo agendamento no Organiza+.</p>
      ${card([
        { label: '👤 Cliente:', value: d.client },
        { label: '📞 Telefone:', value: d.phone || 'Não informado' },
        { label: '📅 Data:', value: d.date },
        { label: '🕐 Horário:', value: d.time },
        ...(d.modality ? [{ label: '📍 Modalidade:', value: d.modality }] : []),
        ...(d.price ? [{ label: '💰 Valor:', value: d.price }] : []),
        ...(d.notes ? [{ label: '📝 Obs:', value: d.notes }] : []),
      ])}
      <a href="https://organizaplusapp.com.br/dashboard"
        style="display:inline-block;margin-top:16px;background:#2C3530;color:#FAFAF7;padding:13px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none">
        Acessar painel →
      </a>
    `),
  }),

  // 24h reminder to client
  reminder: (d) => ({
    subject: '🔔 Lembrete: consulta amanhã',
    html: wrap(`
      <h2 style="color:#2C3530;margin:0 0 6px;font-size:21px">Lembrete de consulta 🔔</h2>
      <p style="color:#5A6660;margin:0 0 16px;font-size:15px">Olá, <strong>${d.client}</strong>! Sua consulta é amanhã.</p>
      ${card([
        { label: '👨‍⚕️ Profissional:', value: d.professional },
        { label: '📅 Data:', value: d.date },
        { label: '🕐 Horário:', value: d.time },
      ])}
      <p style="color:#8A9690;font-size:13px;margin:16px 0 0">Qualquer dúvida, entre em contato com o profissional.</p>
    `),
  }),

  // Welcome after signup
  welcome: (d) => ({
    subject: '🌿 Bem-vindo ao Organiza+',
    html: wrap(`
      <h2 style="color:#2C3530;margin:0 0 6px;font-size:21px">Bem-vindo ao Organiza+! 🌿</h2>
      <p style="color:#5A6660;margin:0 0 16px;font-size:15px">Olá, <strong>${d.name}</strong>! Sua conta foi criada com sucesso.</p>
      <div style="background:#EAF3EC;border-radius:14px;padding:18px 20px;margin:16px 0">
        <p style="margin:0 0 10px;color:#2C3530;font-size:14px;font-weight:700">Próximos passos:</p>
        <p style="margin:0 0 7px;color:#2C3530;font-size:14px">✅ Complete seu perfil</p>
        <p style="margin:0 0 7px;color:#2C3530;font-size:14px">📸 Adicione uma foto profissional</p>
        <p style="margin:0 0 7px;color:#2C3530;font-size:14px">🕐 Configure seus horários</p>
        <p style="margin:0;color:#2C3530;font-size:14px">🔗 Compartilhe seu link único</p>
      </div>
      <a href="https://organizaplusapp.com.br/onboarding"
        style="display:inline-block;margin-top:16px;background:#2C3530;color:#FAFAF7;padding:13px 28px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none">
        Completar meu perfil →
      </a>
    `),
  }),
}

// ── Handler ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  console.log('[email] POST /api/email called')

  try {
    const body = await req.json()
    console.log('[email] Request body:', JSON.stringify({ ...body, html: undefined }))

    const { type, to, appointment_id, professional_id, ...data } = body

    if (!to)   return NextResponse.json({ ok: false, error: 'Missing: to' },   { status: 400 })
    if (!type) return NextResponse.json({ ok: false, error: 'Missing: type' }, { status: 400 })

    const tmpl = templates[type]
    if (!tmpl) return NextResponse.json({ ok: false, error: `Unknown template type: ${type}` }, { status: 400 })

    const { subject, html } = tmpl(data)
    const result = await sendEmail(to, subject, html)

    const logStatus: 'sent' | 'failed' | 'skipped' = result.ok ? 'sent' : (KEY ? 'failed' : 'skipped')

    await logNotification({
      appointment_id: appointment_id || null,
      professional_id: professional_id || null,
      recipient: to,
      event_type: type,
      status: logStatus,
      error_message: result.error || null,
    })

    return NextResponse.json(result)

  } catch (err: any) {
    console.error('[email] Unhandled error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
