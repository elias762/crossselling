import { Fragment } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, Lightbulb, Loader2, RotateCcw, Sparkles, UserCheck } from 'lucide-react'
import type { Progress, ScenarioDef } from '../engine/types'
import { ICONS } from './icons'
import { PHASES } from './phases'
import { cx } from './ui'

const phaseName = (id: string) => PHASES.find((p) => p.id === id)!.label
const phaseShort = (id: string) => PHASES.find((p) => p.id === id)!.short

/**
 * Die sieben Schritte des Agenten. Jeder Use Case hat genau einen Schritt pro Phase –
 * dadurch ist die Leiste in allen Beispielen gleich aufgebaut.
 * Ein Klick auf eine Karte springt zu diesem Schritt.
 */
export function StepTrack({ scenario, p, onGoto }: { scenario: ScenarioDef; p: Progress; onGoto: (i: number) => void }) {
  return (
    <div className="flex items-stretch">
      {scenario.steps.map((s, i) => {
        const Icon = ICONS[s.icon]
        const current = p.active(i)
        const done = p.done(i)
        const working = current && (p.status === 'running' || p.status === 'paused')
        const waiting = current && p.status === 'awaiting'
        const human = !!s.human
        return (
          <Fragment key={i}>
            {i > 0 && (
              <div className="relative flex w-3 shrink-0 items-center xl:w-5" aria-hidden>
                <div className="h-0.5 w-full rounded bg-slate-200" />
                <motion.div
                  className="absolute left-0 h-0.5 rounded bg-brand-500"
                  initial={false}
                  animate={{ width: p.reached(i) ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
            <button
              onClick={() => onGoto(i)}
              title={`Zu Schritt ${i + 1} springen`}
              className={cx(
                'group relative flex min-w-0 flex-1 flex-col rounded-xl border px-3 pt-2.5 pb-2.5 text-left transition-all duration-300',
                !current && !done && 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white',
                current && !human && 'border-brand-400 bg-white shadow-[0_6px_20px_-8px_rgb(31_74_112/0.45)] ring-2 ring-brand-100',
                current && human && 'border-human-500 bg-human-50 shadow-[0_6px_20px_-8px_rgb(106_72_196/0.5)] ring-2 ring-human-200',
                !current && done && 'border-slate-200 bg-white hover:border-slate-300',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cx(
                    'relative grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-300',
                    !current && !done && 'bg-slate-100 text-slate-400',
                    current && !human && 'bg-brand-600 text-white',
                    current && human && 'bg-human-600 text-white',
                    !current && done && (human ? 'bg-human-100 text-human-700' : 'bg-brand-50 text-brand-700'),
                    waiting && 'animate-soft-pulse',
                  )}
                >
                  <Icon className="size-4.5" />
                  {done && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1.5 -bottom-1.5 grid size-4 place-items-center rounded-full bg-emerald-500 text-white ring-2 ring-white"
                    >
                      <Check className="size-2.5" strokeWidth={3.5} />
                    </motion.span>
                  )}
                </span>
                <span
                  className={cx(
                    'min-w-0 truncate text-[0.66rem] font-bold tracking-[0.04em] uppercase',
                    current ? (human ? 'text-human-600' : 'text-brand-600') : done ? 'text-slate-500' : 'text-slate-400',
                  )}
                >
                  {phaseShort(s.phase)}
                </span>
                {working && <Loader2 className={cx('ml-auto size-3.5 shrink-0 animate-spin', human ? 'text-human-500' : 'text-brand-500')} />}
                {waiting && <UserCheck className="ml-auto size-4 shrink-0 text-human-600" />}
              </div>
              <span className={cx('mt-2 line-clamp-2 text-[0.92rem] leading-tight font-semibold hyphens-auto', !current && !done ? 'text-slate-400' : 'text-slate-800')}>
                {s.title}
              </span>
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}

interface CaptionProps {
  scenario: ScenarioDef
  p: Progress
  onApprove: () => void
  onEdit: () => void
  onNext: () => void
  onRepeat: () => void
  onRecap: () => void
  stepMode: boolean
}

/** Zeile unter den Schritten: was passiert gerade – bzw. Merksatz, Freigabe oder Abschluss. */
export function StepCaption({ scenario, p, onApprove, onEdit, onNext, onRepeat, onRecap, stepMode }: CaptionProps) {
  const step = scenario.steps[p.step]
  const nextStep = scenario.steps[p.step + 1]

  if (p.status === 'awaiting' && step?.human) {
    const h = step.human
    return (
      <motion.div
        key="human"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-human-200 bg-gradient-to-r from-human-50 to-white px-5 py-3.5"
      >
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-human-600 text-white">
          <UserCheck className="size-5.5" />
        </div>
        <div className="min-w-[16rem] flex-1">
          <div className="text-[1.05rem] font-semibold text-human-700">Der Agent bereitet vor – der Mitarbeiter behält die Kontrolle.</div>
          <div className="text-[0.92rem] text-slate-600">{h.question}</div>
          {p.editing && h.editHint ? (
            <div className="mt-1 text-sm font-medium text-human-700">{h.editHint}</div>
          ) : (
            <div className="mt-1 text-[0.8rem] font-semibold tracking-wide text-human-500">Automatisieren, wo es sinnvoll ist. Prüfen, wo es wichtig ist.</div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onApprove} className="inline-flex items-center gap-2 rounded-xl bg-human-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-human-700 focus-visible:ring-4 focus-visible:ring-human-200 focus-visible:outline-none">
            <Check className="size-4.5" /> {h.approve}
          </button>
          <button onClick={onEdit} className={cx('rounded-xl border px-4 py-2.5 font-semibold transition', p.editing ? 'border-human-500 bg-human-100 text-human-700' : 'border-human-200 bg-white text-human-700 hover:bg-human-50')}>
            {p.editing ? 'Fertig' : h.edit}
          </button>
        </div>
      </motion.div>
    )
  }

  if (p.holding && step) {
    return (
      <motion.div
        key={`hold-${p.step}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white px-5 py-3.5"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600">
          <Lightbulb className="size-5.5" />
        </span>
        <div className="min-w-[16rem] flex-1">
          <div className="text-[0.78rem] font-bold tracking-[0.1em] text-brand-600 uppercase">
            Schritt {p.step + 1} erledigt · {phaseName(step.phase)}
          </div>
          <div className="text-[1.1rem] leading-snug font-semibold text-slate-900">{step.insight ?? step.description}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRepeat} title="Schritt wiederholen (←)" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50">
            <RotateCcw className="size-4" /> Wiederholen
          </button>
          <button
            onClick={onNext}
            className="animate-soft-pulse inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:ring-4 focus-visible:ring-brand-200 focus-visible:outline-none"
          >
            Weiter: {nextStep?.title} <ArrowRight className="size-4.5" />
          </button>
        </div>
      </motion.div>
    )
  }

  if (p.finished) {
    return (
      <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-3.5">
        <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white">
          <Check className="size-5" strokeWidth={3} />
        </span>
        <div className="flex-1">
          <div className="font-semibold text-emerald-800">Vorgang abgeschlossen</div>
          <div className="text-sm text-emerald-700">Ergebnis: {scenario.outputTitle} – siehe unten.</div>
        </div>
        <button onClick={onRecap} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800">
          <Sparkles className="size-4" /> Was hat die KI hier gemacht?
        </button>
      </motion.div>
    )
  }

  if (!step) {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3.5">
        <div className="min-w-[16rem] flex-1">
          <div className="text-[1rem] leading-snug text-slate-700">
            <span className="font-semibold text-slate-900">Worum geht's? </span>
            {scenario.context}
          </div>
          <div className="mt-1 text-[0.82rem] text-slate-400">
            {stepMode ? 'Der Agent hält nach jedem Schritt an und wartet auf „Weiter“.' : 'Der Agent läuft automatisch durch und hält nur bei der Freigabe an.'}
          </div>
        </div>
        <button onClick={onNext} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
          Ersten Schritt starten <ArrowRight className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <motion.div
      key={p.step}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cx('flex items-center gap-4 rounded-2xl border bg-white px-5 py-3.5', step.human ? 'border-human-200' : 'border-brand-200')}
    >
      <span className={cx('rounded-lg px-2 py-1 text-xs font-bold tracking-wide whitespace-nowrap uppercase', step.human ? 'bg-human-100 text-human-700' : 'bg-brand-50 text-brand-700')}>
        Schritt {p.step + 1} · {phaseName(step.phase)}
      </span>
      <div className="min-w-0 flex-1 text-[1rem]">
        <span className="font-semibold text-slate-900">{step.title}</span>
        <span className="text-slate-400"> – </span>
        <span className="text-slate-600">{step.description}</span>
      </div>
      {p.status === 'paused' && <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">pausiert</span>}
    </motion.div>
  )
}
