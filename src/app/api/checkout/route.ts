import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, email: true, name: true }
    })

    if (!user) {
      return new NextResponse('Usuário não encontrado', { status: 404 })
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: session.user.id
        }
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID

    if (!priceId) {
      return new NextResponse('Preço não configurado', { status: 500 })
    }

    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/sucesso`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancelado`,
      metadata: {
        userId: session.user.id
      }
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error('ERRO AO CRIAR CHECKOUT:', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
