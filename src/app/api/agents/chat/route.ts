import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function fmt(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function daysUntil(date: Date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
}

function analyzeAntonio(wallets: any[], bills: any[], transactions: any[]) {
  const balance = wallets.reduce((s, w) => s + w.balance, 0)
  const totalPending = bills.reduce((s, b) => s + b.amount, 0)
  const liquidBalance = balance - totalPending
  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const overdue = bills.filter(b => daysUntil(b.dueDate) < 0)

  const status = liquidBalance > 0 ? '✅ SAUDÁVEL' : '⚠️ ATENÇÃO'

  return `🦦 **ANTONIO — DIAGNÓSTICO DO CAIXA**\n\n**Status Geral: ${status}**\n\n📊 **RESUMO FINANCEIRO**\n- Saldo Total nas Carteiras: **${fmt(balance)}**\n- Total de Contas Pendentes: **${fmt(totalPending)}**\n- Saldo Líquido Real: **${fmt(liquidBalance)}**\n\n💳 **CARTEIRAS**\n${wallets.length === 0 ? '- Nenhuma carteira cadastrada. Adicione suas carteiras em Carteiras.' : wallets.map(w => `- ${w.name}: **${fmt(w.balance)}**`).join('\n')}\n\n📈 **MOVIMENTAÇÕES (ÚLTIMAS 30)**\n- Total de Entradas: **${fmt(income)}**\n- Total de Saídas: **${fmt(expense)}**\n- Resultado do Período: **${fmt(income - expense)}**\n\n${overdue.length > 0 ? `🚨 **ALERTA — ${overdue.length} CONTA(S) VENCIDA(S)**\n${overdue.map(b => `- ${b.name}: ${fmt(b.amount)} (venceu há ${Math.abs(daysUntil(b.dueDate))} dias)`).join('\n')}\n` : ''}\n**${liquidBalance > 0 ? '✔ Seu caixa está positivo. Continue monitorando as contas a vencer.' : '⚠ Seu saldo líquido está negativo. Priorize quitar as contas vencidas imediatamente.'}**`
}

function analyzeClaudia(wallets: any[], bills: any[], transactions: any[]) {
  const descMap: Record<string, any[]> = {}
  transactions.forEach(t => {
    const key = `${t.description?.toLowerCase().trim()}_${t.amount}`
    if (!descMap[key]) descMap[key] = []
    descMap[key].push(t)
  })
  const duplicates = Object.values(descMap).filter(g => g.length > 1)

  const catMap: Record<string, number> = {}
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    catMap[t.category || 'outros'] = (catMap[t.category || 'outros'] || 0) + t.amount
  })
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 3)
  const totalExp = Object.values(catMap).reduce((s, v) => s + v, 0)

  return `🦉 **CLAUDIA — AUDITORIA DO EXTRATO**\n\n🔍 **ANÁLISE DE DUPLICATAS**\n${duplicates.length === 0 ? '✅ Nenhuma cobrança duplicada encontrada. Extrato limpo!' : `⚠️ ${duplicates.length} possível(is) duplicata(s) detectada(s):\n${duplicates.map(g => `- "${g[0].description}" — ${g.length}x de ${fmt(g[0].amount)}`).join('\n')}`}\n\n📊 **CATEGORIAS COM MAIOR GASTO**\n${topCat.length === 0 ? '- Sem despesas registradas.' : topCat.map(([cat, val]) => `- ${cat}: **${fmt(val)}** (${totalExp > 0 ? ((val / totalExp) * 100).toFixed(1) : 0}% do total)`).join('\n')}\n\n🧾 **CONTAS PENDENTES AUDITADAS**\n${bills.length === 0 ? '✅ Nenhuma conta pendente.' : bills.map(b => `- ${b.name}: ${fmt(b.amount)} — vence em ${daysUntil(b.dueDate)} dias`).join('\n')}\n\n**${duplicates.length === 0 ? '✔ Auditoria concluída sem irregularidades.' : '⚠ Verifique as transações similares e cancele cobranças indevidas.'}**`
}

function analyzeLamar(wallets: any[], bills: any[], transactions: any[], goals: any[]) {
  const balance = wallets.reduce((s, w) => s + w.balance, 0)
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0

  return `🦝 **LAMAR — ESTRATÉGIA DE METAS**\n\n🎯 **CAPACIDADE DE POUPANÇA**\n- Entradas do Período: **${fmt(income)}**\n- Saídas do Período: **${fmt(expense)}**\n- Taxa de Economia: **${savingsRate.toFixed(1)}%**\n- Saldo Disponível para Metas: **${fmt(balance)}**\n\n${goals.length > 0 ? `🏆 **SUAS METAS**\n${goals.map(g => {
    const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
    return `- ${g.name}: ${fmt(g.currentAmount)} de ${fmt(g.targetAmount || g.limitAmount || 0)} (${progress.toFixed(0)}%)`
  }).join('\n')}\n` : '📌 Você ainda não tem metas cadastradas. Crie metas em **Metas** para eu acompanhar seu progresso!\n'}\n**${savingsRate >= 20 ? '✅ Excelente disciplina! Você está poupando bem.' : savingsRate > 0 ? '⚡ Você está no caminho certo, mas pode economizar mais.' : '⚠ Suas despesas estão maiores que as entradas. Revise os gastos.'}**`
}

function analyzeManuel(wallets: any[], bills: any[], transactions: any[]) {
  const catMap: Record<string, number> = {}
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
    catMap[t.category || 'outros'] = (catMap[t.category || 'outros'] || 0) + t.amount
  })
  const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1])
  const totalExp = sorted.reduce((s, [, v]) => s + v, 0)
  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const meta10 = income * 0.1

  const upcomingBills = bills.filter(b => daysUntil(b.dueDate) <= 7 && daysUntil(b.dueDate) >= 0)

  return `🦥 **MANUEL — CONSULTORIA DE ECONOMIA**\n\n💡 **ONDE VAI SEU DINHEIRO?**\n${sorted.length === 0 ? '- Sem despesas registradas ainda.' : sorted.slice(0, 5).map(([cat, val]) => `- ${cat}: **${fmt(val)}** (${totalExp > 0 ? ((val / totalExp) * 100).toFixed(1) : 0}%)`).join('\n')}\n\n🎯 **META DE ECONOMIA SUGERIDA (10% da Renda)**\n- Renda registrada: ${fmt(income)}\n- Poupar pelo menos: **${fmt(meta10)}**\n- Gastos atuais: ${fmt(totalExp)}\n- Espaço para economizar: **${fmt(income - totalExp - meta10)}**\n\n📅 **CONTAS VENCENDO EM 7 DIAS**\n${upcomingBills.length === 0 ? '✅ Nenhuma conta urgente.' : upcomingBills.map(b => `- ${b.name}: ${fmt(b.amount)} (em ${daysUntil(b.dueDate)} dias)`).join('\n')}\n\n**${sorted.length > 0 ? `💡 Maior gasto: "${sorted[0][0]}" com ${fmt(sorted[0][1])}. Considere revisar essa categoria primeiro.` : 'Registre suas despesas para eu identificar onde economizar.'}**`
}

function analyzeDante(wallets: any[], bills: any[], transactions: any[]) {
  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const balance = wallets.reduce((s, w) => s + w.balance, 0)
  const totalBills = bills.reduce((s, b) => s + b.amount, 0)

  // Estimativa IR simples
  let irEstimado = 0
  if (income > 4664.68) irEstimado = income * 0.275 - 896
  else if (income > 3751.05) irEstimado = income * 0.225 - 662.77
  else if (income > 2826.65) irEstimado = income * 0.15 - 381.44
  else if (income > 2259.20) irEstimado = income * 0.075 - 169.44

  const respiroCaixaDias = expense > 0 ? Math.floor(balance / (expense / 30)) : 999

  return `🐢 **DANTE — ANÁLISE FISCAL E TRIBUTÁRIA**\n\n📋 **VISÃO CONTÁBIL DO PERÍODO**\n- Receitas Totais: **${fmt(income)}**\n- Despesas Totais: **${fmt(expense)}**\n- Resultado Líquido: **${fmt(income - expense)}**\n- Compromissos em Aberto: **${fmt(totalBills)}**\n\n⚖️ **ESTIMATIVA TRIBUTÁRIA (IRPF Mensal)**\n${income <= 2259.20 ? '✅ Renda abaixo da faixa de tributação. Sem IRRF estimado.' : `- Base de cálculo: ${fmt(income)}\n- IR estimado: **${fmt(irEstimado)}**\n- Recomendo guardar esse valor para não ser pego de surpresa.`}\n\n🌬️ **RESPIRO FINANCEIRO**\n- Com seu saldo atual, você tem aproximadamente **${respiroCaixaDias > 365 ? '+365' : respiroCaixaDias} dias** de fôlego.\n\n**${irEstimado > 0 ? `⚠ Separe ${fmt(irEstimado)} mensalmente para cobrir obrigações fiscais.` : '✅ Sua situação fiscal está dentro dos limites de isenção.'}**`
}

function answerChat(question: string, wallets: any[], bills: any[], transactions: any[], goals: any[]) {
  const balance = wallets.reduce((s, w) => s + w.balance, 0)
  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const pending = bills.reduce((s, b) => s + b.amount, 0)

  const q = question.toLowerCase()
  if (q.includes('saldo') || q.includes('dinheiro') || q.includes('quanto')) {
    return `💰 Seu saldo total atual é **${fmt(balance)}**.\n\nCarteiras:\n${wallets.map(w => `- ${w.name}: ${fmt(w.balance)}`).join('\n') || '- Nenhuma carteira cadastrada.'}`
  }
  if (q.includes('conta') || q.includes('venc') || q.includes('pagar')) {
    return `📋 Você tem **${bills.length}** conta(s) pendente(s) totalizando **${fmt(pending)}**.\n\n${bills.slice(0, 5).map(b => `- ${b.name}: ${fmt(b.amount)} (vence em ${daysUntil(b.dueDate)} dias)`).join('\n') || 'Nenhuma conta pendente.'}`
  }
  if (q.includes('gasto') || q.includes('despesa') || q.includes('gastand')) {
    return `💸 Nos últimos 30 registros, suas saídas somam **${fmt(expense)}** e entradas **${fmt(income)}**.\n\nResultado: **${fmt(income - expense)}**`
  }
  if (q.includes('meta') || q.includes('objetivo') || q.includes('sonho')) {
    return goals.length > 0
      ? `🎯 Suas metas:\n${goals.map(g => `- ${g.name}: ${fmt(g.currentAmount)} / ${fmt(g.targetAmount || g.limitAmount || 0)}`).join('\n')}`
      : '🎯 Você ainda não tem metas cadastradas. Crie uma em **Metas**!'
  }
  return `🧠 **Contte AI — Resumo Rápido**\n\n💰 Saldo: **${fmt(balance)}**\n📤 Saídas recentes: **${fmt(expense)}**\n📥 Entradas recentes: **${fmt(income)}**\n📋 Contas pendentes: **${fmt(pending)}**\n\nMe pergunte sobre saldo, contas, gastos ou metas para uma análise detalhada!`
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { agentId, customPrompt } = body
    const userId = session.user.id

    const [wallets, bills, transactions, goals] = await Promise.all([
      prisma.wallet.findMany({ where: { userId } }),
      prisma.bill.findMany({ where: { userId, status: 'PENDING' }, orderBy: { dueDate: 'asc' } }),
      prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 30 }),
      prisma.goal.findMany({ where: { userId } }),
    ])

    let response = ''
    if (agentId === 'antonio') response = analyzeAntonio(wallets, bills, transactions)
    else if (agentId === 'claudia') response = analyzeClaudia(wallets, bills, transactions)
    else if (agentId === 'lamar') response = analyzeLamar(wallets, bills, transactions, goals)
    else if (agentId === 'manuel') response = analyzeManuel(wallets, bills, transactions)
    else if (agentId === 'dante') response = analyzeDante(wallets, bills, transactions)
    else if (agentId === 'chat') response = answerChat(customPrompt || '', wallets, bills, transactions, goals)
    else if (agentId === 'custom') response = `🤖 **Análise Personalizada**\n\nMissão: "${customPrompt}"\n\n${answerChat(customPrompt || '', wallets, bills, transactions, goals)}`
    else response = analyzeAntonio(wallets, bills, transactions)

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('ERRO AGENTE:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}