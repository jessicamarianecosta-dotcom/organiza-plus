import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Organiza+ | Agendamento profissional online',
  description: 'Tenha sua página profissional e receba agendamentos online de forma simples. Para psicólogos, nutricionistas, dentistas e muito mais.',
  keywords: 'agendamento online, psicólogo, nutricionista, dentista, fisioterapeuta, página profissional',
  openGraph: {
    title: 'Organiza+ | Agendamento profissional',
    description: 'Página profissional + agendamento online automatizado.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-cream text-brand-dark font-sans">{children}</body>
    </html>
  )
}
