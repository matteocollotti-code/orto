# oRTO

Dashboard Next.js 16 per monitorare orto domestico e piante in casa, con task giornalieri condivisi, meteo di Milano e schede informative per ogni pianta.

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- shadcn/ui components
- API route per task e nuove piante
- Open-Meteo per dati meteo live
- Upstash Redis opzionale per persistenza condivisa su Vercel
- Vercel Analytics
- Vercel Speed Insights

## Avvio locale

In PowerShell su Windows conviene usare `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

App disponibile su [http://localhost:3000](http://localhost:3000).

## Persistenza dei dati

- In locale i dati vengono salvati in un file del progetto.
- Su Vercel, per avere uno stato davvero condiviso tra due persone, aggiungi Redis con una delle coppie di variabili:
  - `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`
  - oppure `KV_REST_API_URL` e `KV_REST_API_TOKEN`
- Se Redis non e configurato, la webapp mostra comunque la dashboard ma usa un fallback temporaneo lato server, non adatto a una sincronizzazione affidabile nel lungo periodo.

## Deploy su Vercel

1. Pubblica il repository su GitHub, GitLab o Bitbucket.
2. Importa il repository da [Vercel](https://vercel.com/new).
3. Vercel riconoscera automaticamente Next.js e usera la configurazione giusta.
4. Se vuoi task condivisi persistenti, aggiungi Redis dalle variabili ambiente.
5. Se aggiungerai altre API key o servizi, inserisci le variabili ambiente nel dashboard Vercel.

## File principali

- `src/app/page.tsx`: entrypoint server-side della dashboard
- `src/app/layout.tsx`: metadata e integrazione Vercel
- `src/app/globals.css`: tema verde e sistema di stile
- `src/components/dashboard-shell.tsx`: dashboard client, task condivisi e dialog nuova pianta
- `src/lib/dashboard.ts`: generazione schede, task quotidiani e vista aggregata
- `src/lib/plant-profiles.ts`: catalogo iniziale piante e profili informativi
- `src/lib/store.ts`: persistenza Redis/file locale
- `src/lib/weather.ts`: fetch e sintesi del meteo di Milano

## Passi utili dopo questa base

- collegare Redis dal progetto Vercel per completare la sync multiutente
- aggiungere autenticazione o nomi utente preimpostati
- affinare le dosi d'acqua in base al diametro reale dei vasi
- collegare notifiche o reminder automatici
