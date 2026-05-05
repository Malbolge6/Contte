import Parser from 'rss-parser'

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml;q=0.9, */*;q=0.8',
  },
  timeout: 15000,
})

async function test() {
  const FEEDS = [
    'https://www.infomoney.com.br/feed/',
    'https://investnews.com.br/feed/',
    'https://g1.globo.com/dynamo/economia/rss2.xml'
  ]
  
  for (const url of FEEDS) {
    console.log(`--- Testando: ${url} ---`)
    try {
      const feed = await parser.parseURL(url)
      console.log(`✅ Sucesso! Título: ${feed.title}`)
      console.log(`Items encontrados: ${feed.items.length}`)
      if (feed.items.length > 0) {
        console.log(`Última notícia: ${feed.items[0].title}`)
      }
    } catch (e: any) {
      console.log(`❌ Erro em ${url}: ${e.message}`)
    }
  }
}

test()
