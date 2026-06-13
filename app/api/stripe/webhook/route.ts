import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  try {
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2026-05-27.dahlia' })

    const body = await req.text()
    const sig  = req.headers.get('stripe-signature') || ''
    let event: import('stripe').Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
    } catch { return NextResponse.json({ error: 'Webhook error' }, { status: 400 }) }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as import('stripe').Stripe.Checkout.Session
      const { userId, plan } = session.metadata || {}
      if (userId && plan) {
        await supabase.from('profiles').update({ plan, plan_active: true, stripe_customer_id: session.customer as string, stripe_subscription_id: session.subscription as string }).eq('id', userId)
      }
    }
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as import('stripe').Stripe.Subscription
      await supabase.from('profiles').update({ plan_active: false }).eq('stripe_subscription_id', sub.id)
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
