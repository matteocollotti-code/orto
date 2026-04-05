# oRTO

Webapp Next.js 16 pronta per Vercel, con una prima interfaccia responsive per gestire colture, sensori, automazioni e stato del deploy.

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- Vercel Analytics
- Vercel Speed Insights

## Avvio locale

In PowerShell su Windows conviene usare `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

App disponibile su [http://localhost:3000](http://localhost:3000).

## Deploy su Vercel

1. Pubblica il repository su GitHub, GitLab o Bitbucket.
2. Importa il repository da [Vercel](https://vercel.com/new).
3. Vercel riconoscera automaticamente Next.js e usera la configurazione giusta.
4. Se aggiungerai API key o database, inserisci le variabili ambiente nel dashboard Vercel.

## File principali

- `src/app/page.tsx`: homepage della webapp
- `src/app/layout.tsx`: metadata e integrazione Vercel
- `src/app/globals.css`: tema, layout e animazioni

## Passi utili dopo questa base

- collegare un database come Supabase, Neon o PlanetScale
- aggiungere autenticazione
- creare API route o Server Actions
- collegare un dominio custom da Vercel
