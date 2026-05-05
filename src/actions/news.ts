'use server'

import Parser from 'rss-parser'

const parser = new Parser()

export async function getFinancialNews() {
  try {
    // Lista de feeds financeiros de alta qualidade
    const FEEDS = [
      'https://www.infomoney.com.br/feed/',
      'https://investnews.com.br/feed/',
      'https://g1.globo.com/dynamo/economia/rss2.xml'
    ]

    const allNews = await Promise.all(
      FEEDS.map(async (url) => {
        try {
          const feed = await parser.parseURL(url)
          return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            contentSnippet: item.contentSnippet,
            source: feed.title || 'Mercado Financeiro'
          }))
        } catch (e) {
          console.error(`Erro ao buscar feed ${url}:`, e)
          return []
        }
      })
    )

    // Junta tudo, remove duplicatas e ordena por data
    const flattened = allNews.flat()
    const sorted = flattened.sort((a, b) => {
      return new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime()
    })

    return sorted.slice(0, 20) // Retorna as 20 mais recentes
  } catch (error) {
    console.error('NEWS_ERROR:', error)
    return []
  }
}
