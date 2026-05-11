import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function resetUserData() {
  const email = 'brunosscontatos@gmail.com'
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`Usuário ${email} não encontrado.`)
      return
    }

    const userId = user.id
    console.log(`Iniciando reset completo para o usuário: ${email} (ID: ${userId})`)

    // Deletar em ordem para evitar problemas de FK (embora Prisma costuma lidar bem se houver cascade, mas é melhor ser explícito)
    
    // 1. Transações
    const tx = await prisma.transaction.deleteMany({ where: { userId } })
    console.log(`- ${tx.count} transações deletadas.`)

    // 2. Contas (Bills)
    const bills = await prisma.bill.deleteMany({ where: { userId } })
    console.log(`- ${bills.count} contas deletadas.`)

    // 3. Metas (Goals)
    const goals = await prisma.goal.deleteMany({ where: { userId } })
    console.log(`- ${goals.count} metas deletadas.`)

    // 4. Assinaturas (Subscriptions - o recurso de streaming, não Stripe)
    const subs = await prisma.subscription.deleteMany({ where: { userId } })
    console.log(`- ${subs.count} assinaturas deletadas.`)

    // 5. Documentos e Pastas
    const docs = await prisma.document.deleteMany({ where: { userId } })
    console.log(`- ${docs.count} documentos deletados.`)

    const folders = await prisma.documentFolder.deleteMany({ where: { userId } })
    console.log(`- ${folders.count} pastas de documentos deletadas.`)

    // 6. Grupos de Contas (BillGroups)
    const billGroups = await prisma.billGroup.deleteMany({ where: { userId } })
    console.log(`- ${billGroups.count} grupos de contas deletados.`)

    // 7. Contribuições de Metas (GoalContributions)
    const contributions = await prisma.goalContribution.deleteMany({
      where: { goal: { userId } }
    })
    console.log(`- ${contributions.count} contribuições de metas deletadas.`)

    // 8. Carteiras (Wallets)
    const wallets = await prisma.wallet.deleteMany({ where: { userId } })
    console.log(`- ${wallets.count} carteiras deletadas.`)

    // 9. Eventos da Timeline
    const timeline = await prisma.timelineEvent.deleteMany({ where: { userId } })
    console.log(`- ${timeline.count} eventos de timeline deletados.`)

    // 10. Posts do Admin (AdminPost não existe no schema atual, é TimelineEvent com tipo admin ou AdminPost se for outro model)
    // No schema atual, AdminPost parece não existir, talvez seja o AdminPost do actions? 
    // Vou checar se existe prisma.adminPost
    if ((prisma as any).adminPost) {
       const adminPosts = await (prisma as any).adminPost.deleteMany({ where: { authorEmail: email } })
       console.log(`- ${adminPosts.count} posts de admin deletados.`)
    }

    console.log('RESET CONCLUÍDO COM SUCESSO! O usuário está limpo.')

  } catch (error) {
    console.error('Erro ao resetar dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetUserData()
