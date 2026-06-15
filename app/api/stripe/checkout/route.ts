import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://organizaplusapp.com.br'

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return NextResponse.json(
      { error: 'Stripe não configurado. Adicione STRIPE_SECRET_KEY no Vercel.' },
      { status: 503 }
    )
  }

  try {
    const stripe = new Stripe(key)
    const { plan, userId, email } = await req.json()

    const PLANS: Record<string, { name: string; amount: number; priceId?: string }> = {
      basic:   { name: '🌿 Organiza+ Basic',   amount: 2700, priceId: process.env.STRIPE_PRICE_BASIC },
      premium: { name: '💎 Organiza+ Premium', amount: 4700, priceId: process.env.STRIPE_PRICE_PREMIUM },
    }

    const planData = PLANS[plan]
    if (!planData) return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 })

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = planData.priceId
      ? { price: planData.priceId, quantity: 1 }
      : {
          price_data: {
            currency: 'brl',
            product_data: { name: planData.name },
            recurring: { interval: 'month' },
            unit_amount: planData.amount,
          },
          quantity: 1,
        }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [lineItem],
      success_url: `${APP_URL}/dashboard?payment=success&plan=${plan}`,
      cancel_url:  `${APP_URL}/planos?cancelled=1`,
      metadata:    { userId, plan },
      subscription_data: { metadata: { userId, plan } },
      locale: 'pt-BR',
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 })
  }
}
