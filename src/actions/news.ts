'use server'

import Parser from 'rss-parser'

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
  },
  timeout: 5000,
})

export async function getFinancialNews() {
  try {
    const FEEDS = [
      { url: 'https://www.infomoney.com.br/feed/', name: 'InfoMoney' },
      { url: 'https://investnews.com.br/feed/', name: 'InvestNews' },
      { url: 'https://g1.globo.com/dynamo/economia/rss2.xml', name: 'G1 Economia' },
      { url: 'https://valor.globo.com/rss/valor', name: 'Valor Econômico' },
      { url: 'https://einvestidor.estadao.com.br/feed/', name: 'E-Investidor' }
    ]

    const newsPromises = FEEDS.map(async (feedSource) => {
      try {
        const feed = await parser.parseURL(feedSource.url)
        return feed.items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: item.contentSnippet || item.description,
          source: feedSource.name
        }))
      } catch (e) {
        console.error(`Falha no feed ${feedSource.name}:`, e)
        return []
      }
    })

    const allResults = await Promise.all(newsPromises)
    const flattened = allResults.flat()
    
    // Filtro de segurança para garantir que temos dados válidos
    const validNews = flattened.filter(item => item.title && item.link)

    const sorted = validNews.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0
      return dateB - dateA
    })

    return sorted.slice(0, 25)
  } catch (error) {
    console.error('CRITICAL_NEWS_ERROR:', error)
    return []
  }
}
