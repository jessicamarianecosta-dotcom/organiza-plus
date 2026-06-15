import { NextRequest, NextResponse } from 'next/server'

const KEY  = process.env.RESEND_API_KEY
// Without a verified domain, Resend only allows sending from noreply@organizaplusapp.com.br
// After adding a custom domain, change to: noreply@organizamais.com.br
const FROM = 'Organiza+ <noreply@organizaplusapp.com.br>'

async function send(to: string, subject: string, html: string) {
  if (!KEY) {
    console.warn('RESEND_API_KEY not set — skipping email')
    return { ok: false, error: 'No API key' }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  const data = await res.json()
  if (!res.ok) console.error('Resend error:', data)
  return { ok: res.ok, data }
}

// ── Email templates ────────────────────────────────────────────────────────
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

function card(rows: {label:string,value:string}[]) {
  return `<div style="background:#EAF3EC;border-radius:14px;padding:18px 20px;margin:16px 0">
    ${rows.map(r => `<p style="margin:0 0 7px;color:#2C3530;font-size:14px"><strong>${r.label}</strong> ${r.value}</p>`).join('')}
  </div>`
}

const templates = {
  // Sent to client after booking
  confirmation: (d: any) => ({
    subject: '✅ Agendamento confirmado',
    html: wrap(`
      <h2 style="color:#2C3530;margin:0 0 6px;font-size:21px">Agendamento confirmado! ✅</h2>
      <p style="color:#5A6660;margin:0 0 4px;font-size:15px">Olá, <strong>${d.client}</strong>!</p>
      <p style="color:#5A6660;margin:0 0 16px;font-size:15px">Seu agendamento foi realizado com sucesso.</p>
      ${card([
        { label:'👨‍⚕️ Profissional:', value: d.professional },
        { label:'📅 Data:', value: d.date },
        { label:'🕐 Horário:', value: d.time },
      ])}
      <p style="color:#8A9690;font-size:13px;margin:16px 0 0;line-height:1.6">Em caso de dúvidas ou para reagendar, entre em contato diretamente com o profissional.</p>
    `)
  }),

  // Sent to professional when new booking arrives
  new_booking: (d: any) => ({
    subject: '📅 Novo agendamento recebido',
    html: wrap(`
      <h2 style="color:#2C3530;margin:0 0 6px;font-size:21px">Novo agendamento! 📅</h2>
      <p style="color:#5A6660;margin:0 0 16px;font-size:15px">Você recebeu um novo agendamento no Organiza+.</p>
      ${card([
        { label:'👤 Cliente:', value: d.client },
        { label:'📞 Telefone:', value: d.phone || 'Não informado' },
        { label:'📅 Data:', value: d.date },
        { label:'🕐 Horário:', value: d.time },
        ...(d.notes ? [{ label:'📝 Obs:', value: d.notes }] : []),
      ])}
      <p style="color:#8A9690;font-size:13px;margin:16px 0 0">Acesse seu painel para confirmar ou reagendar.</p>
    `)
  }),

  // Reminder sent to client (can be sent 24h before)
  reminder: (d: any) => ({
    subject: '🔔 Lembrete: consulta amanhã',
    html: wrap(`
      <h2 style="color:#2C3530;margin:0 0 6px;font-size:21px">Lembrete de consulta 🔔</h2>
      <p style="color:#5A6660;margin:0 0 16px;font-size:15px">Olá, <strong>${d.client}</strong>! Sua consulta é amanhã.</p>
      ${card([
        { label:'👨‍⚕️ Profissional:', value: d.professional },
        { label:'📅 Data:', value: d.date },
        { label:'🕐 Horário:', value: d.time },
      ])}
      <p style="color:#8A9690;font-size:13px;margin:16px 0 0">Qualquer dúvida, entre em contato com o profissional.</p>
    `)
  }),

  // Welcome email after signup
  welcome: (d: any) => ({
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
    `)
  }),
}

// ── Handler ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, to, ...data } = body

    if (!to)   return NextResponse.json({ error: 'Missing: to' },   { status: 400 })
    if (!type) return NextResponse.json({ error: 'Missing: type' }, { status: 400 })

    const tmpl = templates[type as keyof typeof templates]
    if (!tmpl) return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })

    const { subject, html } = tmpl(data)
    const result = await send(to, subject, html)
    return NextResponse.json(result)

  } catch (err: any) {
    console.error('Email route error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
