'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateTaxProfile(data: {
  taxProfile: string
  taxDependents: number
  taxPensionAmount: number
  taxPgblContribution: boolean
  taxBusinessExpenses: number
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Não autorizado')

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        taxProfile: data.taxProfile,
        taxDependents: data.taxDependents,
        taxPensionAmount: data.taxPensionAmount,
        taxPgblContribution: data.taxPgblContribution,
        taxBusinessExpenses: data.taxBusinessExpenses
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/configuracoes')
    return { success: true }
  } catch (error: any) {
    console.error('TAX_UPDATE_ERROR:', error)
    return { success: false, error: error.message }
  }
}

export async function getTaxProfile() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) throw new Error('Não autorizado')

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        taxProfile: true,
        taxDependents: true,
        taxPensionAmount: true,
        taxPgblContribution: true,
        taxBusinessExpenses: true
      }
    })

    return { success: true, data: user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
