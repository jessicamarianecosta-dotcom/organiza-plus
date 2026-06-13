import { NextRequest, NextResponse } from 'next/server'

const RESEND_API_KEY = process.env.RESEND_API_KEY

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return { ok: false, error: 'No Resend key configured' }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: 'Organiza+ <noreply@organizaplus.com.br>', to, subject, html }),
  })
  const data = await res.json()
  return { ok: res.ok, data }
}

function confirmationEmailHtml(client: string, professional: string, date: string, time: string) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'DM Sans',system-ui,sans-serif;background:#FAFAF7;margin:0;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #EDE8E0">
    <div style="background:linear-gradient(135deg,#2C3530,#3d4f47);padding:32px;text-align:center">
      <div style="display:inline-block;width:8px;height:8px;background:#7A9E87;border-radius:50%;margin-right:8px"></div>
      <span style="font-size:22px;color:#FAFAF7;font-weight:700">Organiza<span style="color:#A8C4AD">+</span></span>
    </div>
    <div style="padding:32px">
      <h2 style="color:#2C3530;margin:0 0 8px;font-size:22px">Agendamento confirmado! ✅</h2>
      <p style="color:#5A6660;margin:0 0 24px;font-size:15px">Olá, <strong>${client}</strong>! Seu agendamento foi realizado com sucesso.</p>
      <div style="background:#EAF3EC;border-radius:16px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 8px;color:#2C3530;font-size:14px"><strong>👨‍⚕️ Profissional:</strong> ${professional}</p>
        <p style="margin:0 0 8px;color:#2C3530;font-size:14px"><strong>📅 Data:</strong> ${date}</p>
        <p style="margin:0;color:#2C3530;font-size:14px"><strong>🕐 Horário:</strong> ${time}</p>
      </div>
      <p style="color:#8A9690;font-size:13px;margin:0">Em caso de dúvidas, entre em contato com o profissional diretamente.</p>
    </div>
    <div style="background:#F7F5F0;padding:16px;text-align:center">
      <p style="color:#8A9690;font-size:12px;margin:0">© 2025 Organiza+</p>
    </div>
  </div>
</body></html>`
}

function reminderEmailHtml(client: string, professional: string, date: string, time: string) {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'DM Sans',system-ui,sans-serif;background:#FAFAF7;margin:0;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;border:1px solid #EDE8E0">
    <div style="background:linear-gradient(135deg,#2C3530,#3d4f47);padding:32px;text-align:center">
      <span style="font-size:22px;color:#FAFAF7;font-weight:700">Organiza<span style="color:#A8C4AD">+</span></span>
    </div>
    <div style="padding:32px">
      <h2 style="color:#2C3530;margin:0 0 8px;font-size:22px">Lembrete de consulta 🔔</h2>
      <p style="color:#5A6660;margin:0 0 24px;font-size:15px">Olá, <strong>${client}</strong>! Não esqueça da sua consulta amanhã.</p>
      <div style="background:#EAF3EC;border-radius:16px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 8px;color:#2C3530;font-size:14px"><strong>👨‍⚕️ Profissional:</strong> ${professional}</p>
        <p style="margin:0 0 8px;color:#2C3530;font-size:14px"><strong>📅 Data:</strong> ${date}</p>
        <p style="margin:0;color:#2C3530;font-size:14px"><strong>🕐 Horário:</strong> ${time}</p>
      </div>
    </div>
  </div>
</body></html>`
}

export async function POST(req: NextRequest) {
  try {
    const { type, to, client, professional, date, time } = await req.json()

    if (!to) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    let result
    if (type === 'confirmation') {
      result = await sendEmail(to, '✅ Agendamento confirmado — Organiza+', confirmationEmailHtml(client, professional, date, time))
    } else if (type === 'reminder') {
      result = await sendEmail(to, '🔔 Lembrete de consulta amanhã — Organiza+', reminderEmailHtml(client, professional, date, time))
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
