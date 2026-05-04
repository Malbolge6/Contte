'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createTimelineEvent } from './timeline'

const ADMIN_EMAIL = 'brunosscontatos@gmail.com'
const ADMIN_ID = 'cmoqgewvk000049yzrl4kobzw'

export async function createAdminPost(data: {
  profileType: 'FINANCE' | 'NOTICIAS' | 'ADMIN'
  title: string
  description: string
  amount?: number
}) {
  const session = await getServerSession(authOptions)
  const isOwner = session?.user?.email === ADMIN_EMAIL || session?.user?.id === ADMIN_ID

  if (!isOwner) {
    throw new Error('Acesso negado: Somente o administrador pode criar posts globais.')
  }

  // Create event marked as public and with specific profile
  await prisma.timelineEvent.create({
    data: {
      type: 'admin',
      profileType: data.profileType,
      title: data.title,
      description: data.description,
      amount: data.amount,
      isPublic: true,
      // We don't link to a specific user so it shows for everyone
    }
  })

  revalidatePath('/timeline')
  return { success: true }
}
