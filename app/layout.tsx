import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Organiza+ | Agendamento profissional online',
  description: 'Tenha sua página profissional e receba agendamentos online de forma simples. Para psicólogos, nutricionistas, dentistas, fisioterapeutas e mais.',
  keywords: 'agendamento online, psicólogo, nutricionista, dentista, fisioterapeuta, coach, terapeuta, esteticista',
  metadataBase: new URL('https://organizaplusapp.com.br'),
  openGraph: {
    title: 'Organiza+ | Agendamento profissional online',
    description: 'Página profissional + agendamento online automatizado para profissionais de saúde e bem-estar.',
    type: 'website',
    url: 'https://organizaplusapp.com.br',
    siteName: 'Organiza+',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Organiza+ | Agendamento profissional online',
    description: 'Tenha sua página profissional e receba agendamentos online.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0, padding: 0,
        background: '#F7F5F0',
        color: '#2C3530',
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}>
        {children}
      </body>
    </html>
  )
}
