import { Fragment } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, Loader2, Sparkles, UserCheck } from 'lucide-react'
import type { Progress, ScenarioDef } from '../engine/types'
import { ICONS } from './icons'
import { PHASES, phaseLabel } from './phases'
import { cx } from './ui'

/** Das immer gleiche Grundmuster – zeigt, in welcher Phase der Agent gerade arbeitet. */
export function PhaseRail({ scenario, p }: { scenario: ScenarioDef; p: Progress }) {
  const current = p.step >= 0 && !p.finished ? scenario.steps[p.step]?.phase : undefined
  const visited = new Set(scenario.steps.filter((_, i) => p.reached(i)).map((s) => s.phase))
  const used = new Set(scenario.steps.map((s) => s.phase))
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto thin-scroll">
      <span className="mr-1 shrink-0 text-[0.7rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Grundmuster</span>
      {PHASES.map((ph, i) => {
        const Icon = ICONS[ph.icon]
        const isCur = current === ph.id
        const isVisited = visited.has(ph.id)
        const human = ph.id === 'freigabe'
        return (
          <Fragment key={ph.id}>
            {i > 0 && <ArrowRight className={cx('size-3.5 shrink-0', isVisited ? 'text-brand-400' : 'text-slate-300')} />}
            <span
              className={cx(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.78rem] font-semibold transition-all duration-300',
                isCur && !human && 'border-brand-500 bg-brand-600 text-white shadow-sm',
                isCur && human && 'border-human-500 bg-human-600 text-white shadow-sm',
                !isCur && isVisited && 'border-brand-200 bg-brand-50 text-brand-700',
                !isCur && !isVisited && used.has(ph.id) && 'border-slate-200 bg-white text-slate-500',
                !isCur && !isVisited && !used.has(ph.id) && 'border-dashed border-slate-200 bg-transparent text-slate-300',
              )}
            >
              <Icon className="size-3.5" />
              {ph.label}
            </span>
          </Fragment>
        )
      })}
    </div>
  )
}

export function StepTrack({ scenario, p }: { scenario: ScenarioDef; p: Progress }) {
  const n = scenario.steps.length
  return (
    <div className="flex items-stretch">
      {scenario.steps.map((s, i) => {
        const Icon = ICONS[s.icon]
        const active = p.active(i)
        const done = p.done(i)
        const waiting = active && p.status === 'awaiting'
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
            <motion.div
              layout
              className={cx(
                'relative flex min-w-0 flex-1 flex-col rounded-xl border px-2.5 pt-2.5 pb-2 transition-colors duration-300',
                !active && !done && 'border-slate-200 bg-white/60',
                active && !human && 'border-brand-400 bg-white shadow-[0_6px_20px_-8px_rgb(31_74_112/0.45)] ring-2 ring-brand-100',
                active && human && 'border-human-500 bg-human-50 shadow-[0_6px_20px_-8px_rgb(106_72_196/0.5)] ring-2 ring-human-200',
                done && 'border-slate-200 bg-white',
              )}
              style={{ flexGrow: active ? 1.35 : 1 }}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cx(
                    'relative grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-300',
                    !active && !done && 'bg-slate-100 text-slate-400',
                    active && !human && 'bg-brand-600 text-white',
                    active && human && 'bg-human-600 text-white',
                    done && (human ? 'bg-human-100 text-human-700' : 'bg-brand-50 text-brand-700'),
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
                <span className={cx('text-[0.68rem] font-semibold tracking-wide uppercase', active ? (human ? 'text-human-600' : 'text-brand-600') : 'text-slate-400')}>
                  {i + 1}/{n}
                </span>
                {active && !waiting && <Loader2 className={cx('ml-auto size-3.5 animate-spin', human ? 'text-human-500' : 'text-brand-500')} />}
                {waiting && <UserCheck className="ml-auto size-4 text-human-600" />}
              </div>
              <div className={cx('mt-1.5 line-clamp-2 text-[0.82rem] leading-tight font-semibold hyphens-auto break-words', !active && !done ? 'text-slate-400' : 'text-slate-800')}>{s.title}</div>
              <div className={cx('mt-auto pt-1 text-[0.66rem] font-medium tracking-wide uppercase', human ? 'text-human-500' : 'text-slate-400')}>{phaseLabel(s.phase)}</div>
            </motion.div>
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
  onStart: () => void
  onRecap: () => void
}

/** Beschreibung des aktuellen Schritts bzw. Freigabe-Karte (Human in the Loop). */
export function StepCaption({ scenario, p, onApprove, onEdit, onStart, onRecap }: CaptionProps) {
  const step = scenario.steps[p.step]

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
        <div className="flex-1 text-[0.98rem] text-slate-600">
          <span className="font-semibold text-slate-800">Bereit.</span> Der Agent wartet auf den Input. Mit „Demo starten“ sehen Sie jeden Arbeitsschritt einzeln.
        </div>
        <button onClick={onStart} className="rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
          Demo starten
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
        Schritt {p.step + 1}
      </span>
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-slate-900">{step.title}</span>
        <span className="text-slate-400"> · </span>
        <span className="text-slate-600">{step.description}</span>
      </div>
      {p.status === 'paused' && <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">pausiert</span>}
    </motion.div>
  )
}
