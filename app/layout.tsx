import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Organiza+ | Agendamento profissional online',
  description: 'Tenha sua página profissional e receba agendamentos online de forma simples.',
  keywords: 'agendamento online, psicólogo, nutricionista, dentista, fisioterapeuta',
  openGraph: {
    title: 'Organiza+ | Agendamento profissional',
    description: 'Página profissional + agendamento online automatizado.',
    type: 'website',
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
