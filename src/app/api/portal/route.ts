import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Não autorizado', { status: 401 })
    }

    let stripeCustomerId = user?.stripeCustomerId

    if (!stripeCustomerId) {
      // Cria o cliente no Stripe se não existir
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name!,
        metadata: { userId: session.user.id }
      })
      stripeCustomerId = customer.id
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId }
      })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/configuracoes`
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('PORTAL_ERROR:', error)
    return new NextResponse('Erro interno', { status: 500 })
  }
}
