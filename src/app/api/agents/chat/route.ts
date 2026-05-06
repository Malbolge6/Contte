import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

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

    // 1. Pegar o Contexto Real do Usuário (Bancos, Contas e Histórico)
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
      take: 20 // Limitamos para as últimas 20 para o Claude ser rápido
    })

    // Montando a string de contexto para injetar no cérebro do Claude
    let contextStr = `\n--- CONTEXTO FINANCEIRO REAL DO USUÁRIO ---\n`
    contextStr += `Saldo Total atual: ${formatCurrency(totalBalance)}\n`
    contextStr += `Distribuição nas carteiras/bancos:\n${wallets.map(w => `- ${w.name}: ${formatCurrency(w.balance)}`).join('\n')}\n\n`
    
    contextStr += `Contas a pagar (Pendentes):\n${bills.length === 0 ? 'Nenhuma conta pendente.' : bills.map(b => `- ${b.description}: ${formatCurrency(b.amount)} (Vence em: ${new Date(b.dueDate).toLocaleDateString('pt-BR')})`).join('\n')}\n\n`
    
    contextStr += `Últimas 20 transações do extrato:\n${transactions.map(t => `- [${t.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}] ${t.description}: ${formatCurrency(t.amount)} (${t.category}) em ${new Date(t.date).toLocaleDateString('pt-BR')}`).join('\n')}\n`
    contextStr += `--------------------------------------\n`

    // 2. Lógica de Personalidade dos Agentes
    let systemPrompt = `Você é um agente de inteligência artificial de elite operando dentro da fintech 'Contte'. Responda em Português do Brasil (PT-BR). Seu tom é profissional, high-tech, analítico, porém amigável e focado em proteger o patrimônio do usuário. Use a formatação Markdown para deixar a leitura fácil. Seja direto ao ponto, o usuário não tem tempo a perder.`

    let userInstruction = ''

    if (agentId === 'jubileu') {
      userInstruction = `Você é o Agente Jubileu 👔.\nSua missão: Faça um raio-x rápido da situação. Avise se o Saldo Total cobre as Contas a pagar pendentes. Identifique qual é a maior despesa (SAÍDA) nas últimas transações. Dê um diagnóstico resumido da saúde do fluxo de caixa.`
    } else if (agentId === 'detetive') {
      userInstruction = `Você é o Detetive Duplicatas 🕵️.\nSua missão: Olhe detalhadamente o extrato de transações. Procure por despesas suspeitas (valores iguais ou descrições muito parecidas em datas próximas). Se achar algo estranho, alerte o usuário. Se estiver tudo limpo, diga "Vistoria concluída. Extrato limpo, chefe!".`
    } else if (agentId === 'megamen') {
      const today = new Date().toLocaleDateString('pt-BR')
      userInstruction = `Você é o Megamen 🚀.\nSua missão: A data de hoje é ${today}. Olhe apenas para as transações de SAÍDA que aconteceram na data de hoje. Some o valor. Se passou de R$ 100, ative o 'Protocolo de Contenção' e dê uma bronca (educada, mas firme) avisando para segurar o cartão. Se for menos de R$ 100 ou não tiver gasto hoje, parabenize o usuário pela disciplina tática.`
    } else if (agentId === 'custom') {
      userInstruction = `Você é um Agente Especial customizado.\nA ordem do usuário é: "${customPrompt}"\nCumpra a ordem analisando o contexto financeiro fornecido.`
    } else {
      userInstruction = `Faça um resumo financeiro e dê um insight de inteligência.`
    }

    // 3. Conexão com o Cérebro da Anthropic (Claude)
    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
       return NextResponse.json({ 
         error: 'Chave da API da Anthropic ausente. Fale com o desenvolvedor para adicionar ANTHROPIC_API_KEY no .env' 
       }, { status: 500 })
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Usando o modelo mais inteligente
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `${contextStr}\n\n${userInstruction}`
        }
      ],
    });

    // @ts-ignore
    const responseText = msg.content[0]?.text || "Falha na matriz de comunicação do agente."

    return NextResponse.json({ response: responseText })

  } catch (error: any) {
    console.error("AI_AGENT_ERROR:", error)
    return NextResponse.json({ error: error.message || 'Erro interno no servidor da IA.' }, { status: 500 })
  }
}
