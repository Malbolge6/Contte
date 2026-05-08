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

    // 2. Definir a Missão com Personas Reais
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        response: `🤖 **IA EM MODO DE ESPERA**\n\nChave API não configurada no servidor. Ative a GEMINI_API_KEY para iniciar as análises reais.`
      })
    }

    let systemPrompt = `Você é um agente de inteligência artificial de elite da fintech 'Contte'. 
    Responda SEMPRE em Português do Brasil (PT-BR). 
    Seu tom é profissional, tecnológico (estilo fintech premium) e analítico.
    Use formatação Markdown para deixar as respostas bonitas (negrito, listas, etc).
    Sempre use os dados reais fornecidos no contexto para basear suas respostas.`

    let agentMission = ''

    if (agentId === 'antonio') {
      agentMission = `Você é o Antonio 🦦👔, o líder estrategista da Contte. Sua missão é analisar o saldo consolidado (${formatCurrency(totalBalance)}) contra as contas pendentes e dar um diagnóstico de liderança sobre a saúde do caixa. Seja direto, confiante e organizacional.`
    } else if (agentId === 'claudia') {
      agentMission = `Você é a Claudia 🦉🔍, a auditora detalhista. Analise o extrato em busca de cobranças duplicadas, padrões de gastos suspeitos ou qualquer anomalia. Se tudo estiver limpo, valide a integridade das movimentações com precisão cirúrgica.`
    } else if (agentId === 'lamar') {
      agentMission = `Você é o Lamar 🦝🚀, o estrategista de metas e sonhos. Olhe para o saldo atual e foque em como transformar esse capital em conquistas. Incentive o usuário a bater suas metas e dê um passo tático para a próxima grande compra.`
    } else if (agentId === 'manuel') {
      agentMission = `Você é o Manuel 🦥💰, o mentor de economia. Com calma e sabedoria, identifique onde o usuário está gastando demais (olhe as categorias do extrato) e sugira um corte específico para poupar pelo menos 10% no próximo mês.`
    } else if (agentId === 'dante') {
      agentMission = `Você é o Dante 🐢⚖️, o contador fiscal. Analise os valores totais e as movimentações sob a ótica de organização tributária e fôlego fiscal. Sua fala é ponderada e focada em manter as obrigações em dia e o "respiro" financeiro positivo.`
    } else if (agentId === 'chat') {
      agentMission = `Você é o Cérebro Central da Contte 🧠. Responda à dúvida do usuário: "${customPrompt}". Use todos os dados financeiros disponíveis para dar uma resposta ultra-personalizada.`
    } else if (agentId === 'custom') {
      agentMission = `Ordem especial: "${customPrompt}". Execute como um agente de elite.`
    }

    // 3. Conexão Real com Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const fullPrompt = `
      ${systemPrompt}
      
      MISSÃO DO AGENTE:
      ${agentMission}
      
      CONTEXTO DO USUÁRIO:
      ${contextStr}
      
      INSTRUÇÃO FINAL:
      Gere um relatório curto, impactante e com a personalidade do seu agente.
    `

    const result = await model.generateContent(fullPrompt)
    const response = result.response.text()

    return NextResponse.json({ response })

  } catch (error: any) {
    console.error("ERRO CRÍTICO CHAT:", error)
    return NextResponse.json({ error: 'Erro interno no servidor de IA' }, { status: 500 })
  }
}