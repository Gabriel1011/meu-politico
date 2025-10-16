import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AlertProvider } from '@/hooks/use-alert'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Meu Político - Conectando Cidadãos e Vereadores',
    template: '%s | Meu Político',
  },
  description: 'Plataforma SaaS multi-tenant que conecta vereadores e cidadãos de forma transparente',
  keywords: ['vereador', 'cidadão', 'política', 'transparência', 'participação popular', 'ocorrências'],
  authors: [{ name: 'Gabriel Almeida' }],
  creator: 'Gabriel Almeida',
  publisher: 'Meu Político',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Meu Político',
  },
  applicationName: 'Meu Político',
  category: 'government',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0D47A1' },
    { media: '(prefers-color-scheme: dark)', color: '#1976D2' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <AlertProvider />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
