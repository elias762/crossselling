import { useEffect, useRef } from 'react'
import { Pause, Play, RotateCcw, UserCheck } from 'lucide-react'
import type { ScenarioDef } from '../engine/types'
import { useAgentRun } from '../engine/useAgentRun'
import { ActivityPanel } from './ActivityPanel'
import { ICONS } from './icons'
import { PhaseRail, StepCaption, StepTrack } from './Workflow'
import { Badge, cx } from './ui'

interface Props {
  scenario: ScenarioDef
  speed: number
  setSpeed: (s: number) => void
  onReset: () => void
  onRecap: () => void
  present: boolean
}

export function DemoView({ scenario, speed, setSpeed, onReset, onRecap, present }: Props) {
  const { progress: p, log, start, pause, approve, edit } = useAgentRun(scenario, speed)
  const scrollRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const last = scenario.outputFrom ?? scenario.steps.length - 1
  const showOutput = p.reached(last)

  // Ergebnis ins Bild holen, sobald es entsteht
  useEffect(() => {
    if (showOutput) outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [showOutput])

  // Beim Start nach oben scrollen, danach den gerade bearbeiteten Bereich im Blick behalten
  useEffect(() => {
    const box = scrollRef.current
    if (!box) return
    if (p.step === 0 && p.beat === 0) {
      box.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (p.step >= last) return // Ergebnis übernimmt
    // Bereich des aktuellen Schritts (bzw. des letzten davor) suchen
    let el: HTMLElement | undefined
    let best = -1
    box.querySelectorAll<HTMLElement>('[data-anchor]').forEach((n) => {
      const a = Number(n.dataset.anchor)
      if (a <= p.step && a > best) {
        best = a
        el = n
      }
    })
    if (!el) return
    const t = window.setTimeout(() => {
      const b = box.getBoundingClientRect()
      const r = el!.getBoundingClientRect()
      if (r.bottom > b.bottom - 8) box.scrollBy({ top: Math.min(r.bottom - b.bottom + 24, r.top - b.top - 8), behavior: 'smooth' })
      else if (r.top < b.top) box.scrollBy({ top: r.top - b.top - 8, behavior: 'smooth' })
    }, 120)
    return () => window.clearTimeout(t)
  }, [p.step, p.beat, last])

  // Tastatursteuerung für die Präsentation
  const keys = useRef({ start, pause, approve, onReset, onRecap, p })
  keys.current = { start, pause, approve, onReset, onRecap, p }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || e.metaKey || e.ctrlKey || e.altKey) return
      const k = keys.current
      if (e.code === 'Space') {
        e.preventDefault()
        if (k.p.status === 'running') k.pause()
        else if (k.p.status === 'awaiting') k.approve()
        else k.start()
      } else if (e.key === 'Enter' && k.p.status === 'awaiting') {
        e.preventDefault()
        k.approve()
      } else if (e.key === 'r' || e.key === 'R') {
        k.onReset()
      } else if (e.key === 'ArrowRight' && k.p.finished) {
        k.onRecap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const Icon = ICONS[scenario.icon]
  const { Workspace, Output } = scenario
  const running = p.status === 'running'
  const startLabel = p.status === 'paused' ? 'Fortsetzen' : p.finished ? 'Erneut abspielen' : 'Demo starten'

  return (
    <div className="flex min-h-0 min-w-0 flex-1 gap-4">
      {/* MITTE */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        {/* Kopf des Use Cases + Steuerung */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-slate-200 bg-white px-5 py-3">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Icon className="size-5.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">{scenario.name}</h2>
              <Badge tone="neutral">Input: {scenario.source}</Badge>
            </div>
            <div className="truncate text-[0.95rem] text-slate-500">
              {scenario.subtitle}
              {!present && (
                <span className="text-slate-400">
                  {' '}
                  · Kundencase: <span className="italic">„{scenario.origin}“</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {p.status === 'awaiting' ? (
              <span className="inline-flex items-center gap-2 rounded-xl border border-human-200 bg-human-50 px-4 py-2.5 font-semibold text-human-700">
                <UserCheck className="size-4" /> Wartet auf Freigabe
              </span>
            ) : running ? (
              <button onClick={pause} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50">
                <Pause className="size-4" /> Pause
              </button>
            ) : (
              <button
                onClick={start}
                className={cx(
                  'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40',
                  'bg-brand-600 hover:bg-brand-700 focus-visible:ring-4 focus-visible:ring-brand-200 focus-visible:outline-none',
                  p.status === 'idle' && 'animate-soft-pulse',
                )}
              >
                <Play className="size-4 fill-current" /> {startLabel}
              </button>
            )}
            <button onClick={onReset} title="Zurücksetzen (R)" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50">
              <RotateCcw className="size-4" /> <span className="hidden 2xl:inline">Zurücksetzen</span>
            </button>
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Geschwindigkeit">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cx('rounded-lg px-3 py-1.5 text-sm font-semibold transition', speed === s ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700')}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        <PhaseRail scenario={scenario} p={p} />
        <StepTrack scenario={scenario} p={p} />
        <StepCaption scenario={scenario} p={p} onApprove={approve} onEdit={edit} onStart={start} onRecap={onRecap} />

        {/* Arbeitsfläche + Ergebnis */}
        <div ref={scrollRef} className="thin-scroll min-h-0 flex-1 overflow-y-auto rounded-2xl pr-1">
          <Workspace p={p} />

          <div ref={outputRef} className="scroll-mt-2 pt-5 pb-4">
            <div className="mb-2 flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">
              Ergebnis · {scenario.outputTitle}
            </div>
            {showOutput ? (
              <Output p={p} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-6 text-center text-slate-400">
                Das Ergebnis erscheint hier, sobald der Agent den Vorgang abgeschlossen hat.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RECHTS */}
      <div className={cx('min-h-0 shrink-0', present ? 'w-[22rem] max-[1500px]:w-[18rem]' : 'w-[21rem] max-[1500px]:w-[18rem] 2xl:w-[23rem]')}>
        <ActivityPanel scenario={scenario} p={p} log={log} />
      </div>
    </div>
  )
}
