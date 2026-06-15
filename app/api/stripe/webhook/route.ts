import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const key    = process.env.STRIPE_SECRET_KEY
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !secret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const stripe   = new Stripe(key)
  const body     = await req.text()
  const sig      = req.headers.get('stripe-signature') || ''
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  console.log('Stripe webhook:', event.type)

  try {
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const sub  = event.data.object as Stripe.Subscription
      const uid  = sub.metadata?.userId
      const plan = sub.metadata?.plan || 'basic'
      if (uid) {
        await supabase.from('profiles').update({
          plan: plan as 'basic' | 'premium',
          plan_active: sub.status === 'active' || sub.status === 'trialing',
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
        }).eq('id', uid)
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const uid  = session.metadata?.userId
      const plan = session.metadata?.plan || 'basic'
      if (uid && session.mode === 'subscription') {
        await supabase.from('profiles').update({
          plan: plan as 'basic' | 'premium',
          plan_active: true,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        }).eq('id', uid)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const uid = sub.metadata?.userId
      if (uid) {
        await supabase.from('profiles').update({ plan_active: false }).eq('id', uid)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
