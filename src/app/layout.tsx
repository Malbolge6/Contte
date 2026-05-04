import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Contte — Controle Financeiro',
  description: 'Controle financeiro inteligente para o seu dia a dia. PIX, boletos, metas e muito mais.',
  keywords: 'controle financeiro, contas a pagar, pix, boleto, metas financeiras',
  authors: [{ name: 'Contte' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Contte',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Contte — Controle Financeiro',
    description: 'Controle financeiro inteligente para o seu dia a dia.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
