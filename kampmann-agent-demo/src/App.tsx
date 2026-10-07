import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Lightbulb, Maximize2, Minimize2, Presentation } from 'lucide-react'
import { SCENARIOS } from './scenarios'
import { DemoView } from './components/DemoView'
import { ICONS } from './components/icons'
import { PotentialBoard, RecapScreen, StartScreen } from './components/Screens'
import { Toaster, cx } from './components/ui'

type Screen = 'start' | 'demo' | 'board'

function Logo() {
  return (
    <span className="grid size-10 place-items-center rounded-xl bg-brand-700 text-white shadow-sm" aria-hidden>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21" />
      </svg>
    </span>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)
  const [runKey, setRunKey] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [present, setPresent] = useState(false)
  const [recap, setRecap] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [narrow, setNarrow] = useState(() => window.innerWidth < 1500)
  const compact = present || narrow

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!
  const next = SCENARIOS.find((s) => s.id === scenario.next)

  useEffect(() => {
    document.documentElement.classList.toggle('present', present)
  }, [present])

  useEffect(() => {
    const r = () => setNarrow(window.innerWidth < 1500)
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [])

  useEffect(() => {
    const f = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', f)
    return () => document.removeEventListener('fullscreenchange', f)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }

  const select = useCallback((id: string) => {
    setScenarioId(id)
    setRunKey((k) => k + 1)
    setRecap(false)
    setScreen('demo')
  }, [])

  const reset = useCallback(() => setRunKey((k) => k + 1), [])

  // Globale Tastenkürzel: 1–6 Use Case, P Präsentationsmodus, F Vollbild
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || e.metaKey || e.ctrlKey || e.altKey) return
      if (screen !== 'demo' || recap) return
      const n = Number(e.key)
      if (n >= 1 && n <= SCENARIOS.length) select(SCENARIOS[n - 1].id)
      else if (e.key === 'p' || e.key === 'P') setPresent((v) => !v)
      else if (e.key === 'f' || e.key === 'F') toggleFullscreen()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, recap, select])

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}
      <header className="flex shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5 py-3">
        <button onClick={() => setScreen('start')} className="flex items-center gap-3 text-left" title="Zum Startbildschirm">
          <Logo />
          <span>
            <span className="block text-lg leading-tight font-semibold tracking-tight text-slate-900">Kampmann AI Agent</span>
            <span className="block text-sm leading-tight text-slate-500">Wie KI Geschäftsprozesse unterstützen kann</span>
          </span>
        </button>
        <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 md:inline">Interaktiver Demonstrator · Beispieldaten</span>
        <div className="flex-1" />
        {screen !== 'board' && (
          <button onClick={() => setScreen('board')} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 lg:inline-flex">
            <Lightbulb className="size-4" /> Potenzial-Board
          </button>
        )}
        <button onClick={toggleFullscreen} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" title="Vollbild (F)" aria-label="Vollbild">
          {fullscreen ? <Minimize2 className="size-4.5" /> : <Maximize2 className="size-4.5" />}
        </button>
        <button
          onClick={() => setPresent((v) => !v)}
          className={cx('inline-flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm font-semibold transition', present ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
          title="Präsentationsmodus (P)"
        >
          <Presentation className="size-4" />
          Präsentationsmodus
          <span className={cx('relative h-5 w-9 rounded-full transition-colors', present ? 'bg-brand-600' : 'bg-slate-300')}>
            <span className={cx('absolute top-0.5 size-4 rounded-full bg-white shadow transition-all', present ? 'left-[1.15rem]' : 'left-0.5')} />
          </span>
        </button>
      </header>

      {/* INHALT */}
      <main className="flex min-h-0 flex-1 gap-4 p-4">
        {screen === 'start' && <StartScreen onStart={() => setScreen('demo')} />}

        {screen === 'board' && <PotentialBoard onBack={() => setScreen('demo')} />}

        {screen === 'demo' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex min-h-0 min-w-0 flex-1 gap-4">
            {/* LINKS: Use Cases */}
            <nav className={cx('thin-scroll flex shrink-0 flex-col gap-2 overflow-y-auto transition-all duration-300', compact ? 'w-[4.25rem]' : 'w-[17.5rem] 2xl:w-[19rem]')}>
              {!compact && <div className="px-1 pt-1 text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Anwendungsfälle</div>}
              {SCENARIOS.map((s, i) => {
                const Icon = ICONS[s.icon]
                const active = s.id === scenarioId
                return (
                  <button
                    key={s.id}
                    onClick={() => select(s.id)}
                    title={`${s.name} – ${s.subtitle} (${i + 1})`}
                    className={cx(
                      'group flex items-start gap-3 rounded-2xl border text-left transition-all',
                      compact ? 'justify-center p-2.5' : 'p-3',
                      active ? 'border-brand-300 bg-white shadow-[0_4px_16px_-8px_rgb(31_74_112/0.4)] ring-1 ring-brand-200' : 'border-transparent hover:border-slate-200 hover:bg-white',
                    )}
                  >
                    <span className={cx('relative grid size-10 shrink-0 place-items-center rounded-xl transition-colors', active ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 group-hover:text-brand-600')}>
                      <Icon className="size-5" />
                      {compact && <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-slate-700 text-[0.6rem] font-bold text-white">{i + 1}</span>}
                    </span>
                    {!compact && (
                      <span className="min-w-0">
                        <span className={cx('block font-semibold leading-snug', active ? 'text-slate-900' : 'text-slate-700')}>{s.name}</span>
                        <span className="mt-0.5 block text-[0.85rem] leading-snug text-slate-500">{s.subtitle}</span>
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            <DemoView key={`${scenarioId}-${runKey}`} scenario={scenario} speed={speed} setSpeed={setSpeed} onReset={reset} onRecap={() => setRecap(true)} present={present} />
          </motion.div>
        )}
      </main>

      {/* Dauerhafte Workshop-Botschaft */}
      <footer className="flex shrink-0 items-center gap-4 border-t border-slate-200 bg-white px-5 py-2.5 text-[0.85rem] text-slate-500">
        <span className="size-1.5 shrink-0 rounded-full bg-brand-500" />
        <span className="flex-1">
          KI übernimmt nicht zwangsläufig den gesamten Prozess. Sie kann einzelne Arbeitsschritte vorbereiten, Informationen zusammenführen und Mitarbeitende bei Entscheidungen unterstützen.
        </span>
        {!present && screen === 'demo' && (
          <span className="hidden shrink-0 text-xs text-slate-400 2xl:inline">
            Leertaste Start/Pause · Enter Freigabe · R Reset · 1–6 Case · P Präsentation · F Vollbild
          </span>
        )}
      </footer>

      <Toaster />
      <AnimatePresence>
        {recap && (
          <RecapScreen
            scenario={scenario}
            next={next}
            onClose={() => setRecap(false)}
            onNext={() => next && select(next.id)}
            onBoard={() => {
              setRecap(false)
              setScreen('board')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
