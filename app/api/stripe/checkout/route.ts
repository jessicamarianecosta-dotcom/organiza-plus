import { NextRequest, NextResponse } from 'next/server'

const PLANS = {
  basic:   { price: 2700, name: '🌿 Organiza+ Basic' },
  premium: { price: 4700, name: '💎 Organiza+ Premium' },
}

export async function POST(req: NextRequest) {
  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { apiVersion: '2026-05-27.dahlia' })

    const { plan, userId, email } = await req.json()
    const planData = PLANS[plan as keyof typeof PLANS]
    if (!planData) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe não configurado. Adicione STRIPE_SECRET_KEY nas variáveis de ambiente do Vercel.' }, { status: 503 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price_data: { currency: 'brl', product_data: { name: planData.name }, recurring: { interval: 'month' }, unit_amount: planData.price }, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://organiza-plus-five.vercel.app'}/dashboard?payment=success`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL || 'https://organiza-plus-five.vercel.app'}/planos`,
      metadata: { userId, plan },
    })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
