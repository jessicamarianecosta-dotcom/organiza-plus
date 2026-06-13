# Deploy do Organiza+ — 1 comando

## Pré-requisito
- Node.js 18+ instalado
- Conta Vercel (já conectada ao Supabase criado)

## Deploy instantâneo

```bash
npx vercel --prod
```

Durante o setup, responda:
- Project name: `organiza-plus`
- Framework: `Next.js` (detectado automaticamente)
- Root directory: `./`

## Variáveis de ambiente (já configuradas no vercel.json)
```
NEXT_PUBLIC_SUPABASE_URL=https://fqxwmvcxxhtgbxsuqaty.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## Supabase já configurado
- Projeto: organiza-plus (sa-east-1 — Brasil)
- ID: fqxwmvcxxhtgbxsuqaty
- URL: https://fqxwmvcxxhtgbxsuqaty.supabase.co
- Tabelas: profiles, availability, blocked_dates, appointments
- RLS ativo em todas as tabelas
