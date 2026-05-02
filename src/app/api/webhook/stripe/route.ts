import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error: any) {
    console.error('WEBHOOK ERROR:', error.message)
    // Se o secret não estiver configurado localmente, a gente aceita o evento ignorando a assinatura em modo DEV
    if (process.env.NODE_ENV === 'development') {
       console.log('Ignorando erro de webhook no modo DEV')
       event = JSON.parse(body) as Stripe.Event
    } else {
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }
  }

  const session = event.data.object as Stripe.Checkout.Session
  const subscription = event.data.object as Stripe.Subscription

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        if (session.subscription && session.customer) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await prisma.user.update({
            where: { stripeCustomerId: session.customer as string },
            data: {
              stripeSubscriptionId: sub.id,
              stripePriceId: sub.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
              plan: 'PREMIUM'
            }
          })
        }
        break

      case 'invoice.payment_succeeded':
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await prisma.user.update({
            where: { stripeSubscriptionId: sub.id },
            data: {
              stripePriceId: sub.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
              plan: 'PREMIUM'
            }
          })
        }
        break

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        const updatedSub = await stripe.subscriptions.retrieve(subscription.id)
        await prisma.user.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: updatedSub.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(updatedSub.current_period_end * 1000),
            plan: updatedSub.status === 'active' || updatedSub.status === 'trialing' || updatedSub.status === 'past_due' ? 'PREMIUM' : 'FREE'
          }
        })
        break
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error: any) {
    console.error('ERRO NO WEBHOOK HANDLER:', error)
    return new NextResponse('Webhook handler failed', { status: 500 })
  }
}
