import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function elevate() {
  try {
    const user = await prisma.user.update({
      where: { email: 'brunosscontatos@gmail.com' },
      data: { plan: 'PREMIUM' }
    })
    console.log('CONTA ELEVADA: Bruno agora é PREMIUM/ADMIN!', user.id)
  } catch (err) {
    console.error('ERRO: Usuário não encontrado. Bruno, certifique-se de que já criou a conta novamente após o reset.', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

elevate()
