import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import type { Progress } from '../engine/types'
import { createStore } from '../engine/store'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export function Panel({ title, icon, children, className, aside, anchor }: { title?: string; icon?: ReactNode; children: ReactNode; className?: string; aside?: ReactNode; anchor?: number }) {
  return (
    <div data-anchor={anchor} className={cx('rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)]', className)}>
      {title && (
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          {icon && <span className="text-slate-400">{icon}</span>}
          <span className="text-[0.8rem] font-semibold tracking-wide text-slate-500 uppercase">{title}</span>
          {aside && <span className="ml-auto">{aside}</span>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="mb-2 text-[0.72rem] font-semibold tracking-[0.08em] text-slate-400 uppercase">{children}</div>
}

/** Blendet Inhalt sanft ein, sobald `show` true ist. */
export function Reveal({ show, children, className, delay = 0 }: { show: boolean; children: ReactNode; className?: string; delay?: number }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Platzhalter für noch nicht erreichte Arbeitsschritte. */
export function Placeholder({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400', className)}>{children}</div>
  )
}

type ChipState = 'waiting' | 'loading' | 'done'
export function SystemChip({ label, state, icon }: { label: string; state: ChipState; icon?: ReactNode }) {
  return (
    <div
      className={cx(
        'inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-300',
        state === 'waiting' && 'border-slate-200 bg-slate-50 text-slate-400',
        state === 'loading' && 'border-brand-200 bg-brand-50 text-brand-700',
        state === 'done' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
      )}
    >
      {icon}
      {label}
      {state === 'loading' && <Loader2 className="size-3.5 animate-spin" />}
      {state === 'done' && <Check className="size-3.5" />}
    </div>
  )
}

export function chipState(p: Progress, step: number, doneBeat: number): ChipState {
  if (!p.reached(step)) return 'waiting'
  return p.reached(step, doneBeat) ? 'done' : 'loading'
}

export function FileChip({ name, meta, kind = 'excel' }: { name: string; meta?: string; kind?: 'excel' | 'pdf' }) {
  const Icon = kind === 'excel' ? FileSpreadsheet : FileText
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <span className={cx('grid size-9 place-items-center rounded-lg', kind === 'excel' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600')}>
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-800">{name}</span>
        {meta && <span className="block text-xs text-slate-500">{meta}</span>}
      </span>
    </div>
  )
}

export type BadgeTone = 'ok' | 'warn' | 'neutral' | 'brand' | 'human'
export function Badge({ tone = 'neutral', children, icon }: { tone?: BadgeTone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        tone === 'ok' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        tone === 'warn' && 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
        tone === 'neutral' && 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
        tone === 'brand' && 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
        tone === 'human' && 'bg-human-50 text-human-700 ring-1 ring-human-200',
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/** Läuft von 0 bis 1 über `ms`, sobald `run` true wird. */
export function useTween(run: boolean, ms: number, skip = false) {
  const [t, setT] = useState(skip ? 1 : 0)
  const msRef = useRef(ms)
  msRef.current = ms
  useEffect(() => {
    if (skip) {
      setT(1)
      return
    }
    if (!run) {
      setT(0)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const loop = (now: number) => {
      const v = Math.min(1, (now - t0) / msRef.current)
      setT(v)
      if (v < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [run, skip])
  return t
}

/** Text, der „getippt“ erscheint, solange der zugehörige Schritt aktiv ist. */
export function Typewriter({ text, show, active, ms, className }: { text: string; show: boolean; active: boolean; ms: number; className?: string }) {
  const t = useTween(show, ms, show && !active)
  if (!show) return null
  const n = Math.round(text.length * t)
  return <span className={cx(className, n < text.length && 'caret')}>{text.slice(0, n)}</span>
}

const nf = new Intl.NumberFormat('de-DE')
export function CountUp({ value, run, ms, skip, className }: { value: number; run: boolean; ms: number; skip?: boolean; className?: string }) {
  const t = useTween(run, ms, skip)
  const eased = 1 - Math.pow(1 - t, 3)
  return <span className={cx('tabular', className)}>{nf.format(Math.round(value * eased))}</span>
}

export function StatTile({ value, label, tone = 'neutral', run, skip }: { value: number; label: string; tone?: 'neutral' | 'ok' | 'warn' | 'brand'; run: boolean; skip?: boolean }) {
  return (
    <div
      className={cx(
        'rounded-xl border px-4 py-3',
        tone === 'neutral' && 'border-slate-200 bg-white',
        tone === 'ok' && 'border-emerald-200 bg-emerald-50/60',
        tone === 'warn' && 'border-amber-200 bg-amber-50/70',
        tone === 'brand' && 'border-brand-200 bg-brand-50/70',
      )}
    >
      <div
        className={cx(
          'text-3xl font-semibold tracking-tight',
          tone === 'neutral' && 'text-slate-800',
          tone === 'ok' && 'text-emerald-700',
          tone === 'warn' && 'text-amber-700',
          tone === 'brand' && 'text-brand-700',
        )}
      >
        <CountUp value={value} run={run} ms={900} skip={skip} />
      </div>
      <div className="mt-0.5 text-sm text-slate-600">{label}</div>
    </div>
  )
}

export const eur = (v: number) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00a0€'
export const pct = (v: number) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '\u00a0%'

/* ------------------------------------------------------------------ */
/* Markierter Text: Stellen werden hervorgehoben, sobald der Agent sie  */
/* „erkannt“ hat. Optional mit Tipp-Animation (z. B. Transkript).       */
/* ------------------------------------------------------------------ */

export type Seg = { text: string; at?: [number, number]; tag?: string }

export function MarkedText({ segs, p, typed = 1, className }: { segs: Seg[]; p: Progress; typed?: number; className?: string }) {
  const total = segs.reduce((n, s) => n + s.text.length, 0)
  let left = Math.round(total * typed)
  return (
    <p className={cx(className, left < total && 'caret')}>
      {segs.map((s, i) => {
        if (left <= 0) return null
        const txt = s.text.slice(0, left)
        left -= s.text.length
        if (!s.at) return <span key={i}>{txt}</span>
        const on = p.reached(s.at[0], s.at[1])
        return (
          <span key={i} className="relative">
            <span className={cx('-mx-0.5 rounded px-0.5 transition-colors duration-500 [box-decoration-break:clone]', on && 'bg-amber-100 text-slate-900 ring-1 ring-amber-300')}>{txt}</span>
            {on && s.tag && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-none absolute -top-[1.05rem] left-0 rounded bg-amber-500 px-1.5 text-[0.6rem] leading-[0.9rem] font-semibold whitespace-nowrap text-white"
              >
                {s.tag}
              </motion.span>
            )}
          </span>
        )
      })}
    </p>
  )
}

/* ------------------------------------------------------------------ */
/* Toast                                                                */
/* ------------------------------------------------------------------ */

const toastStore = createStore<{ id: number; text: string } | null>(null)
export function toast(text: string) {
  const id = Date.now()
  toastStore.set({ id, text })
  window.setTimeout(() => toastStore.get()?.id === id && toastStore.set(null), 3200)
}
export function Toaster() {
  const t = toastStore.use()
  return (
    <AnimatePresence>
      {t && (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl"
        >
          {t.text}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/* Datum: „vergangener Donnerstag“ relativ zu heute                     */
/* ------------------------------------------------------------------ */

export function lastWeekday(weekday: number) {
  const d = new Date()
  const diff = (d.getDay() - weekday + 7) % 7 || 7
  d.setDate(d.getDate() - diff)
  return d
}
export const fmtDay = (d: Date) => d.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' })
export const fmtShort = (d: Date) => d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
