import { useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, Info, Pause, Play, RotateCcw, UserCheck } from 'lucide-react'
import type { ScenarioDef } from '../engine/types'
import { useAgentRun } from '../engine/useAgentRun'
import { ActivityPanel } from './ActivityPanel'
import { ICONS } from './icons'
import { StepCaption, StepTrack } from './Workflow'
import { Badge, cx } from './ui'

interface Props {
  scenario: ScenarioDef
  speed: number
  setSpeed: (s: number) => void
  stepMode: boolean
  setStepMode: (v: boolean) => void
  onReset: () => void
  onRecap: () => void
  present: boolean
  /** false, solange ein Overlay (Abschlussbild) offen ist */
  keysActive: boolean
}

const SPEEDS = [
  { v: 0.6, label: 'Langsam' },
  { v: 1, label: 'Normal' },
  { v: 2, label: 'Schnell' },
]

export function DemoView({ scenario, speed, setSpeed, stepMode, setStepMode, onReset, onRecap, present, keysActive }: Props) {
  const { progress: p, log, start, pause, next, goto, approve, edit } = useAgentRun(scenario, speed, stepMode)

  // „Zurück“: laufenden Schritt neu beginnen – oder, wenn er gerade erst startet, zum vorherigen
  const back = () => {
    if (p.status === 'idle') return
    if (p.finished) return goto(scenario.steps.length - 1)
    const justStarted = p.status === 'running' && p.beat === 0
    goto(justStarted ? p.step - 1 : p.step)
  }
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
    if (p.step >= last) {
      box.querySelectorAll<HTMLElement>('[data-focus]').forEach((n) => n.removeAttribute('data-focus'))
      return // Ergebnis übernimmt
    }
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
    box.querySelectorAll<HTMLElement>('[data-focus]').forEach((n) => n !== el && n.removeAttribute('data-focus'))
    if (!el) return
    el.setAttribute('data-focus', 'true')
    const t = window.setTimeout(() => {
      const b = box.getBoundingClientRect()
      const r = el!.getBoundingClientRect()
      if (r.bottom > b.bottom - 8) box.scrollBy({ top: Math.min(r.bottom - b.bottom + 24, r.top - b.top - 8), behavior: 'smooth' })
      else if (r.top < b.top) box.scrollBy({ top: r.top - b.top - 8, behavior: 'smooth' })
    }, 120)
    return () => window.clearTimeout(t)
  }, [p.step, p.beat, last])

  // Tastatursteuerung – funktioniert auch mit einem Presenter (Pfeiltasten / Bild auf/ab)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || e.metaKey || e.ctrlKey || e.altKey) return
      if (!keysActive) return
      const st = p.status
      if (e.code === 'Space') {
        e.preventDefault()
        if (st === 'running') pause()
        else if (st === 'paused' || st === 'done') start()
        else next()
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        if (p.finished) onRecap()
        else next()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        back()
      } else if (e.key === 'Enter' && st === 'awaiting') {
        e.preventDefault()
        approve()
      } else if (e.key === 'r' || e.key === 'R') {
        onReset()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const Icon = ICONS[scenario.icon]
  const { Workspace, Output } = scenario
  const running = p.status === 'running'

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
            <div className="flex min-w-0 items-center gap-2 text-[0.95rem] text-slate-500">
              <span className="truncate">{scenario.subtitle}</span>
              <span className="group/info relative shrink-0">
                <button className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.8rem] font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:bg-slate-100 focus:text-slate-700 focus:outline-none">
                  <Info className="size-3.5" /> Worum geht's?
                </button>
                <span className="pointer-events-none absolute top-full left-0 z-30 mt-1.5 w-[26rem] rounded-xl border border-slate-200 bg-white p-3.5 text-[0.92rem] leading-snug text-slate-700 opacity-0 shadow-xl transition group-focus-within/info:opacity-100 group-hover/info:opacity-100">
                  {scenario.context}
                  <span className="mt-2 block text-[0.8rem] text-slate-400">
                    Kundencase: <span className="italic">„{scenario.origin}“</span>
                  </span>
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Ablauf">
              {[
                { v: true, label: 'Schritt für Schritt' },
                { v: false, label: 'Automatisch' },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => setStepMode(m.v)}
                  className={cx('rounded-lg px-3 py-1.5 text-sm font-semibold transition', stepMode === m.v ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700')}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={back}
              disabled={p.status === 'idle'}
              title="Schritt zurück / wiederholen (←)"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ArrowLeft className="size-4" />
            </button>

            {p.status === 'awaiting' ? (
              <span className="inline-flex items-center gap-2 rounded-xl border border-human-200 bg-human-50 px-4 py-2.5 font-semibold text-human-700">
                <UserCheck className="size-4" /> Wartet auf Freigabe
              </span>
            ) : running ? (
              <button onClick={pause} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50">
                <Pause className="size-4" /> Pause
              </button>
            ) : p.status === 'paused' ? (
              <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-700">
                <Play className="size-4 fill-current" /> Fortsetzen
              </button>
            ) : p.finished ? (
              <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-700">
                <Play className="size-4 fill-current" /> Erneut abspielen
              </button>
            ) : (
              <button
                onClick={next}
                className={cx(
                  'inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:ring-4 focus-visible:ring-brand-200 focus-visible:outline-none',
                  'animate-soft-pulse',
                )}
              >
                {p.status === 'idle' ? (
                  <>
                    <Play className="size-4 fill-current" /> Start
                  </>
                ) : (
                  <>
                    Weiter <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            )}

            <button onClick={onReset} title="Zurücksetzen (R)" className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 transition hover:bg-slate-50">
              <RotateCcw className="size-4" />
            </button>
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Geschwindigkeit">
              {SPEEDS.map((sp) => (
                <button
                  key={sp.v}
                  onClick={() => setSpeed(sp.v)}
                  className={cx('rounded-lg px-2.5 py-1.5 text-sm font-semibold transition', speed === sp.v ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700')}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <StepTrack scenario={scenario} p={p} onGoto={goto} />
        <StepCaption scenario={scenario} p={p} onApprove={approve} onEdit={edit} onNext={next} onRepeat={() => goto(p.step)} onRecap={onRecap} stepMode={stepMode} />

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
