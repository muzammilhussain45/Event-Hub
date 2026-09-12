import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/actions/order.actions'

export async function POST(request: Request) {
  const body = await request.text()

  const sig = request.headers.get('stripe-signature')
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!sig || !endpointSecret || !secretKey) {
    console.error('Stripe webhook is missing its secret key, signature or webhook secret')
    return NextResponse.json({ message: 'Missing signature or webhook secret' }, { status: 400 })
  }

  const stripe = new Stripe(secretKey)

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, endpointSecret)
  } catch (err) {
    // 400 tells Stripe the delivery failed so it will retry instead of dropping it.
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ message: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const { id, amount_total, metadata } = event.data.object

    const order = {
      stripeId: id,
      eventId: metadata?.eventId || '',
      buyerId: metadata?.buyerId || '',
      totalAmount: amount_total ? (amount_total / 100).toString() : '0',
      createdAt: new Date(),
    }

    try {
      const newOrder = await createOrder(order)
      return NextResponse.json({ message: 'OK', order: newOrder })
    } catch (err) {
      console.error('Failed to create order from checkout session:', err)
      return NextResponse.json({ message: 'Failed to create order' }, { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}
