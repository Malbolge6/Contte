import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// V4.1 - Forçando redeploy para carregar nova API Key e usando Descoberta Dinâmica
export const dynamic = 'force-dynamic'

// Formatador de moeda para o contexto da IA
function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { agentId, customPrompt } = body

    // 1. Pegar o Contexto Real (O que os Agentes vão ler)
    const userId = session.user.id
    
    // Buscar dados em paralelo para velocidade
    const [wallets, bills, transactions] = await Promise.all([
      prisma.wallet.findMany({ where: { userId } }),
      prisma.bill.findMany({ 
        where: { userId, status: 'PENDING' },
        orderBy: { dueDate: 'asc' }
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30 // Aumentado para 30 transações para melhor análise
      })
    ])

    const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0)
    
    // Montando a memória do Agente de forma mais estruturada
    let contextStr = `\n--- DADOS FINANCEIROS EM TEMPO REAL ---\n`
    contextStr += `Saldo Total Consolidado: ${formatCurrency(totalBalance)}\n`
    contextStr += `Carteiras Ativas:\n${wallets.map(w => `- ${w.name}: ${formatCurrency(w.balance)}`).join('\n')}\n\n`
    contextStr += `Contas Pendentes:\n${bills.length === 0 ? 'Nenhuma conta pendente.' : bills.map(b => `- ${b.name}: ${formatCurrency(b.amount)} (Vencimento: ${new Date(b.dueDate).toLocaleDateString('pt-BR')})`).join('\n')}\n\n`
    contextStr += `Últimas Movimentações:\n${transactions.map(t => `- [${t.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}] ${t.description}: ${formatCurrency(t.amount)} (${t.category}) em ${new Date(t.date).toLocaleDateString('pt-BR')}`).join('\n')}\n`
    contextStr += `--------------------------------------\n`

    // 2. Definir a Missão
    let systemPrompt = `Você é um agente de inteligência artificial de elite da fintech 'Contte'. 
    Responda SEMPRE em Português do Brasil (PT-BR). 
    Seu tom é profissional, tecnológico (estilo fintech premium) e analítico.
    Use formatação Markdown para deixar as respostas bonitas (negrito, listas, etc).
    Sempre use os dados reais fornecidos no contexto para basear suas respostas.`
    
    let userInstruction = ''

    if (agentId === 'jubileu') {
      userInstruction = `Você é o Agente Jubileu 👔. Analise o saldo total vs contas pendentes. Identifique o maior gasto recente e dê um diagnóstico curto da saúde financeira.`
    } else if (agentId === 'detetive') {
      userInstruction = `Você é o Detetive Duplicatas 🕵️. Procure por cobranças repetidas ou valores suspeitos no extrato. Se tudo estiver ok, valide a segurança.`
    } else if (agentId === 'megamen') {
      const today = new Date().toLocaleDateString('pt-BR')
      userInstruction = `Você é o Megamen 🚀. Data de hoje: ${today}. Verifique gastos de SAÍDA hoje. Se ultrapassar R$ 100, dê um alerta tático.`
    } else if (agentId === 'tiopatinhas') {
      userInstruction = `Você é o Tio Patinhas 💰. Seja ranzinza e econômico. Aponte onde o usuário está "rasgando dinheiro" e dê uma dica ácida para economizar.`
    } else if (agentId === 'chat') {
      userInstruction = `O usuário disse: "${customPrompt}". Responda como o cérebro central do Contte, usando os dados financeiros dele.`
    } else if (agentId === 'custom') {
      userInstruction = `Ordem especial: "${customPrompt}".`
    }

    // 3. Conexão com a Inteligência
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        response: `🤖 **IA EM MODO DE ESPERA**\n\nChave API não configurada. Configure a GEMINI_API_KEY no painel da Vercel para ativar.` 
      })
    }

    // MODO DE SIMULAÇÃO (IA DESATIVADA TEMPORARIAMENTE)
    const mockResponses: Record<string, string> = {
      'antonio': `👔 **RELATÓRIO DO ANTONIO**\n\nOlá! Sou o Antonio. Analisei seu caixa e organizei sua vida financeira. \n\n*   **Saldo Total:** ${formatCurrency(totalBalance)}\n*   **Status:** Tudo sob controle.`,
      'claudia': `🕵️ **RELATÓRIO DA CLAUDIA**\n\nFiz uma varredura no seu extrato e não encontrei nenhuma cobrança duplicada óbvia.`,
      'lamar': `🚀 **RELATÓRIO DO LAMAR**\n\nFoco nas metas! Analisei seus sonhos e estou traçando o plano perfeito para você alcançar seu PC Gamer e sua próxima viagem.`,
      'tiopatinhas': `💰 **RELATÓRIO DO TIO PATINHAS**\n\nQuá-quá! Economize mais!`
    }

    const response = mockResponses[agentId] || mockResponses['chat']
    
    return NextResponse.json({ response })

  } catch (error: any) {
    console.error("ERRO CRÍTICO CHAT:", error)
    return NextResponse.json({ error: 'Erro interno no servidor de IA' }, { status: 500 })
  }
}
