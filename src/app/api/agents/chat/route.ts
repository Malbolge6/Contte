import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

    const { agentId, customPrompt } = await req.json()

    // 1. Pegar o Contexto Real (O que os Agentes vão ler)
    const userId = session.user.id
    
    const wallets = await prisma.wallet.findMany({ where: { userId } })
    const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0)
    
    const bills = await prisma.bill.findMany({ 
      where: { userId, status: 'PENDING' },
      orderBy: { dueDate: 'asc' }
    })
    
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 20 // Últimas 20 transações para leitura rápida
    })

    // Montando a memória do Agente
    let contextStr = `\n--- CONTEXTO FINANCEIRO REAL DO USUÁRIO ---\n`
    contextStr += `Saldo Total atual: ${formatCurrency(totalBalance)}\n`
    contextStr += `Distribuição nas carteiras/bancos:\n${wallets.map(w => `- ${w.name}: ${formatCurrency(w.balance)}`).join('\n')}\n\n`
    contextStr += `Contas a pagar (Pendentes):\n${bills.length === 0 ? 'Nenhuma conta pendente.' : bills.map(b => `- ${b.description}: ${formatCurrency(b.amount)} (Vence em: ${new Date(b.dueDate).toLocaleDateString('pt-BR')})`).join('\n')}\n\n`
    contextStr += `Últimas 20 transações do extrato:\n${transactions.map(t => `- [${t.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}] ${t.description}: ${formatCurrency(t.amount)} (${t.category}) em ${new Date(t.date).toLocaleDateString('pt-BR')}`).join('\n')}\n`
    contextStr += `--------------------------------------\n`

    // 2. Definir a Missão
    let systemPrompt = `Você é um agente de inteligência artificial de elite operando dentro da fintech 'Contte'. Responda em Português do Brasil (PT-BR). Seu tom é profissional, high-tech, analítico, porém amigável e focado em proteger o patrimônio do usuário. Use a formatação Markdown. Seja direto ao ponto.`
    
    let userInstruction = ''

    if (agentId === 'jubileu') {
      userInstruction = `Você é o Agente Jubileu 👔. Faça um raio-x rápido da situação. Avise se o Saldo Total cobre as Contas a pagar pendentes. Identifique qual é a maior despesa (SAÍDA) nas últimas transações. Dê um diagnóstico resumido da saúde do fluxo de caixa.`
    } else if (agentId === 'detetive') {
      userInstruction = `Você é o Detetive Duplicatas 🕵️. Olhe detalhadamente o extrato de transações. Procure por despesas suspeitas (valores iguais ou descrições muito parecidas em datas próximas). Se achar algo estranho, alerte o usuário. Se estiver tudo limpo, diga que a área está segura.`
    } else if (agentId === 'megamen') {
      const today = new Date().toLocaleDateString('pt-BR')
      userInstruction = `Você é o Megamen 🚀. A data de hoje é ${today}. Olhe apenas para as transações de SAÍDA que aconteceram na data de hoje. Some o valor. Se passou de R$ 100, ative o 'Protocolo de Contenção' e dê uma bronca tática. Se for menos de R$ 100, parabenize o usuário pela disciplina.`
    } else if (agentId === 'tiopatinhas') {
      userInstruction = `Você é o Tio Patinhas 💰. Analise o extrato e o saldo. Identifique padrões de gastos fúteis ou categorias onde o usuário está gastando demais. Dê uma dica agressiva, porém cômica, de onde ele pode cortar gastos para investir mais dinheiro no fim do mês.`
    } else if (agentId === 'chat') {
      userInstruction = `Você é a Contte AI, o cérebro principal da plataforma. O usuário está conversando com você via chat. Responda à seguinte mensagem do usuário de forma útil, direta e usando os dados reais dele como base para a sua resposta. Mensagem do usuário: "${customPrompt}"`
    } else if (agentId === 'custom') {
      userInstruction = `Você é um Agente Especial customizado. A ordem primordial do usuário é: "${customPrompt}". Cumpra a ordem analisando rigorosamente o contexto financeiro fornecido.`
    }

    // 3. Conexão com o Google Gemini (Gratuito)
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        response: `🤖 **MODO OFFLINE**\n\nPara que eu, seu Agente Customizado, consiga pensar livremente e executar a ordem "${customPrompt}", eu preciso de um cérebro.\n\nPor favor, vá no Google AI Studio, gere sua chave gratuita e adicione no arquivo .env como GEMINI_API_KEY.` 
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // O modelo gemini-1.5-flash é ultra rápido e excelente para leitura de dados
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt 
    })

    const prompt = `${contextStr}\n\n${userInstruction}`
    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    return NextResponse.json({ response: responseText })

  } catch (error: any) {
    console.error("AI_AGENT_ERROR:", error)
    return NextResponse.json({ error: error.message || 'Erro interno no servidor da IA.' }, { status: 500 })
  }
}
