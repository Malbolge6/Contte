'use server'

import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function cancelSubscription() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Não autorizado')

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeSubscriptionId: true }
    })

    if (!user?.stripeSubscriptionId) {
      throw new Error('Assinatura não encontrada')
    }

    // Cancela no Stripe ao fim do período atual
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    })

    // Opcional: Atualizar algo no banco, mas o Webhook do Stripe cuidará disso de forma mais segura
    
    revalidatePath('/configuracoes')
    return { success: true }
  } catch (error: any) {
    console.error('CANCEL_ERROR:', error)
    return { success: false, error: error.message }
  }
}
