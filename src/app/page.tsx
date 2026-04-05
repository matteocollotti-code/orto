const cultivationRows = [
  {
    name: "Basilico Genovese",
    zone: "Serra A1",
    humidity: "64%",
    growth: 82,
    note: "Luce stabile, raccolta prevista tra 4 giorni.",
  },
  {
    name: "Pomodoro Cuore",
    zone: "Modulo Sud",
    humidity: "58%",
    growth: 67,
    note: "Irrigazione serale attiva, nutrienti in range.",
  },
  {
    name: "Lattuga Verde",
    zone: "Terrazza Ovest",
    humidity: "71%",
    growth: 91,
    note: "Ciclo quasi completo, resa stimata in aumento.",
  },
];

const automations = [
  {
    title: "Sync dati sensori",
    cadence: "Ogni 15 minuti",
    state: "Attiva",
  },
  {
    title: "Build preview interfaccia pubblica",
    cadence: "Push su main",
    state: "Ready",
  },
  {
    title: "Report performance Vercel",
    cadence: "Ogni lunedi 08:00",
    state: "In invio",
  },
];

const agenda = [
  {
    time: "08:30",
    task: "Controllo umidita moduli Nord",
    owner: "Ops",
  },
  {
    time: "11:00",
    task: "Review build preview e speed insights",
    owner: "Product",
  },
  {
    time: "15:30",
    task: "Aggiornamento piano raccolta clienti",
    owner: "Field",
  },
];

const releaseNotes = [
  "Routing App Router e deploy zero-config su Vercel",
  "Analytics e Speed Insights agganciati nel layout",
  "UI responsive con shell editoriale e workspace operativo",
  "Base pronta per aggiungere API, auth e variabili ambiente",
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--page-bg)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 orchard-grid opacity-70" />
      <div className="pointer-events-none absolute left-[-10%] top-[-6%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,_rgba(143,169,108,0.34)_0%,_rgba(143,169,108,0)_68%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(202,168,112,0.28)_0%,_rgba(202,168,112,0)_66%)] blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="fade-in-panel border-b border-[var(--border)] bg-[color:rgba(245,242,233,0.82)] px-6 py-6 backdrop-blur-2xl lg:w-[18.5rem] lg:border-b-0 lg:border-r lg:px-7 lg:py-8">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-[var(--text-muted)]">
                oRTO
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                Control Room
              </h1>
            </div>
            <div className="status-pill">
              <span className="pulse-dot" />
              Online
            </div>
          </div>

          <nav className="mt-8 grid gap-2 text-sm lg:mt-14">
            {["Panoramica", "Colture", "Sensori", "Automazioni", "Deploy"].map(
              (item, index) => (
                <a
                  key={item}
                  href={index === 4 ? "#deploy" : "#workspace"}
                  className={`nav-item ${index === 0 ? "nav-item-active" : ""}`}
                >
                  <span>{item}</span>
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    0{index + 1}
                  </span>
                </a>
              ),
            )}
          </nav>

          <div className="mt-8 space-y-4 border-t border-[var(--border)] pt-6 text-sm lg:mt-16">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Workspace</span>
              <span className="font-mono text-xs uppercase tracking-[0.25em]">
                Milano
              </span>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
              Regia operativa per serre urbane, interfacce pubbliche e flusso di
              deploy su Vercel.
            </p>
          </div>
        </aside>

        <main id="workspace" className="flex-1 px-5 py-5 sm:px-6 lg:px-8 lg:py-8">
          <section className="hero-panel stagger-rise grid gap-6 rounded-[2rem] border border-[var(--border)] px-6 py-6 sm:px-8 sm:py-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
            <div className="max-w-3xl">
              <div className="status-pill mb-6 w-fit">
                <span className="pulse-dot" />
                Vercel-ready workspace
              </div>
              <h2 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-5xl xl:text-[4.5rem]">
                Una webapp viva per coltivazioni, dati e deploy nello stesso
                flusso.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
                Questa base usa Next.js 16 ed e pensata per essere pubblicata su
                Vercel senza configurazioni extra. Hai gia una shell pronta per
                gestire stato dei moduli, automazioni, metriche e preview della
                release.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  className="action-primary"
                  href="https://vercel.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Collega a Vercel
                </a>
                <a
                  className="action-secondary"
                  href="https://vercel.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apri documentazione
                </a>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-slab">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.35em] text-[var(--text-muted)]">
                      Live Module
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.05em]">
                      Serra Centro
                    </p>
                  </div>
                  <div className="status-pill">
                    <span className="pulse-dot" />
                    Stable
                  </div>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Umidita", "64%"],
                    ["Temperatura", "22.4 C"],
                    ["Luce attiva", "13h"],
                  ].map(([label, value]) => (
                    <div key={label} className="metric-cell">
                      <p className="metric-label">{label}</p>
                      <p className="metric-value">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-stack">
                <div>
                  <p className="metric-label">Deploy pipeline</p>
                  <p className="mt-2 text-lg font-medium">Production build pronta</p>
                </div>
                <div className="space-y-3">
                  {[
                    "Repo rilevato in automatico",
                    "Analytics attive nel layout",
                    "Speed Insights abilitate",
                  ].map((item) => (
                    <div key={item} className="inline-row">
                      <span className="row-marker" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-12">
            <div className="surface xl:col-span-8">
              <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Panoramica giornaliera</p>
                  <h3 className="section-title">Stato operativo dei moduli</h3>
                </div>
                <p className="max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                  Una vista unica per capire cosa sta crescendo, cosa va
                  irrigato e quali deploy stanno muovendo la parte digitale del
                  progetto.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {[
                  ["Colture attive", "18", "+3 questa settimana"],
                  ["Sensori online", "42", "1 modulo da verificare"],
                  ["Build previews", "07", "Ultima in 38s"],
                  ["Ticket aperti", "04", "Priorita media"],
                ].map(([label, value, helper]) => (
                  <div key={label} className="metric-cell">
                    <p className="metric-label">{label}</p>
                    <p className="metric-value">{value}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {helper}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                {cultivationRows.map((row) => (
                  <article key={row.name} className="data-row">
                    <div className="flex flex-col gap-1">
                      <p className="text-lg font-medium tracking-[-0.03em]">
                        {row.name}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {row.zone} - Umidita {row.humidity}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1 px-0 lg:px-6">
                      <div className="progress-track">
                        <span
                          className="progress-fill"
                          style={{ width: `${row.growth}%` }}
                        />
                      </div>
                    </div>

                    <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                      {row.note}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <aside id="deploy" className="surface xl:col-span-4">
              <p className="section-kicker">Deploy</p>
              <h3 className="section-title">Setup Vercel gia predisposto</h3>

              <div className="mt-6 space-y-4">
                <div className="inline-row rounded-[1.25rem] border border-[var(--border)] bg-[color:rgba(248,245,237,0.75)] px-4 py-4">
                  <span className="row-marker" />
                  <div>
                    <p className="font-medium">Framework rilevato</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Next.js viene gestito nativamente da Vercel.
                    </p>
                  </div>
                </div>

                <div className="inline-row rounded-[1.25rem] border border-[var(--border)] bg-[color:rgba(248,245,237,0.75)] px-4 py-4">
                  <span className="row-marker" />
                  <div>
                    <p className="font-medium">Monitoring incluso</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Analytics e Speed Insights sono gia agganciati al layout.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-[var(--border)] pt-5">
                <p className="metric-label">Checklist rapida</p>
                <div className="mt-4 space-y-3">
                  {releaseNotes.map((note) => (
                    <div key={note} className="inline-row">
                      <span className="row-marker" />
                      <span className="text-sm leading-6 text-[var(--text-secondary)]">
                        {note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="surface xl:col-span-7">
              <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Automazioni</p>
                  <h3 className="section-title">Flussi attivi e prossime azioni</h3>
                </div>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Una base utile anche se poi vorrai collegare API, webhook o un
                  database esterno.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {automations.map((item) => (
                  <div key={item.title} className="data-row">
                    <div>
                      <p className="text-lg font-medium tracking-[-0.03em]">
                        {item.title}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {item.cadence}
                      </p>
                    </div>
                    <div className="status-pill">{item.state}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface xl:col-span-5">
              <p className="section-kicker">Agenda</p>
              <h3 className="section-title">Ritmo della giornata</h3>

              <div className="mt-6 space-y-4">
                {agenda.map((item) => (
                  <div key={item.time} className="inline-row items-start">
                    <div className="w-16 shrink-0 font-mono text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.task}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Responsabile {item.owner}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
