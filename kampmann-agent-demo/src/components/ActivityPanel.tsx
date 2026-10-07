import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Activity, CircleCheck, Info, Sparkles, TriangleAlert, UserCheck, ScanText } from 'lucide-react'
import type { LogEntry, Progress, ScenarioDef, Tone } from '../engine/types'
import { cx } from './ui'

const TONE: Record<Tone, { icon: typeof Info; cls: string }> = {
  info: { icon: Info, cls: 'text-slate-400' },
  data: { icon: ScanText, cls: 'text-brand-500' },
  success: { icon: CircleCheck, cls: 'text-emerald-600' },
  warning: { icon: TriangleAlert, cls: 'text-amber-500' },
  human: { icon: UserCheck, cls: 'text-human-600' },
}

const STATUS: Record<Progress['status'], { label: string; dot: string }> = {
  idle: { label: 'Bereit', dot: 'bg-slate-300' },
  running: { label: 'Arbeitet', dot: 'bg-brand-500 animate-pulse' },
  paused: { label: 'Pausiert', dot: 'bg-slate-400' },
  hold: { label: 'Wartet auf „Weiter“', dot: 'bg-brand-400' },
  awaiting: { label: 'Wartet auf Freigabe', dot: 'bg-human-500 animate-pulse' },
  done: { label: 'Abgeschlossen', dot: 'bg-emerald-500' },
}

export function ActivityPanel({ scenario, p, log }: { scenario: ScenarioDef; p: Progress; log: LogEntry[] }) {
  const feedRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = feedRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [log.length])

  const facts = scenario.facts.filter((f) => p.reached(f.step, f.beat ?? 0))
  const st = STATUS[p.status]

  return (
    <aside className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex min-h-0 flex-[3] flex-col rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Activity className="size-4 text-brand-600" />
          <span className="font-semibold text-slate-900">Agent Activity</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            <span className={cx('size-2 rounded-full', st.dot)} />
            {st.label}
          </span>
        </div>
        <div ref={feedRef} className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {log.length === 0 && (
            <div className="px-1 py-6 text-center text-sm text-slate-400">
              Hier erscheinen die Arbeitsschritte des Agenten – so, wie ein Kollege kurz Bescheid geben würde.
            </div>
          )}
          <AnimatePresence initial={false}>
            {log.map((e, i) => {
              const t = TONE[e.tone]
              const Icon = t.icon
              const latest = i === log.length - 1 && !p.finished
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cx(
                    'flex items-start gap-2.5 rounded-lg px-2 py-1.5',
                    latest && 'bg-slate-50',
                    !p.finished && e.step < p.step && 'opacity-50',
                    e.tone === 'human' && 'bg-human-50',
                    e.tone === 'warning' && 'bg-amber-50/70',
                  )}
                >
                  <Icon className={cx('mt-0.5 size-4 shrink-0', t.cls)} />
                  <span className={cx('flex-1 text-[0.9rem] leading-snug', e.tone === 'human' ? 'font-semibold text-human-700' : 'text-slate-700')}>{e.text}</span>
                  <span className="tabular mt-0.5 shrink-0 font-mono text-[0.68rem] text-slate-400">{e.time}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex min-h-0 flex-[2] flex-col rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Sparkles className="size-4 text-amber-500" />
          <span className="font-semibold text-slate-900">Erkannte Informationen</span>
          <span className="ml-auto text-xs font-semibold text-slate-400 tabular">{facts.length}/{scenario.facts.length}</span>
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-2">
          {facts.length === 0 && <div className="py-4 text-center text-sm text-slate-400">Noch keine Informationen erkannt.</div>}
          <dl className="divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {facts.map((f) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, backgroundColor: 'rgb(254 243 199)' }}
                  animate={{ opacity: 1, backgroundColor: 'rgb(255 255 255 / 0)' }}
                  transition={{ duration: 1.2 }}
                  className="-mx-2 grid grid-cols-[minmax(0,8.5rem)_1fr] gap-2 rounded px-2 py-1.5 text-[0.88rem]"
                >
                  <dt className="text-slate-500">{f.label}</dt>
                  <dd className={cx('font-semibold', f.tone === 'warning' ? 'text-amber-700' : 'text-slate-900')}>{f.value}</dd>
                </motion.div>
              ))}
            </AnimatePresence>
          </dl>
        </div>
      </div>
    </aside>
  )
}
