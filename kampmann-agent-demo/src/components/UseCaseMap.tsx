import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  ChartColumn,
  Check,
  FileText,
  Headset,
  MessageSquareText,
  Store,
  Warehouse,
  Pause,
  Play,
  PlayCircle,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Tags,
  TriangleAlert,
  Truck,
  X,
  Zap,
} from 'lucide-react'
import { GROUPS, IDEAS, TYPES, type GroupId, type Idea, type IdeaType } from '../ideas/ideas'
import { ICONS } from './icons'
import { PHASES } from './phases'
import { cx } from './ui'

const TYPE_STYLE: Record<IdeaType, { icon: typeof Zap; badge: string; dot: string }> = {
  report: { icon: ChartColumn, badge: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-500' },
  control: { icon: ShieldCheck, badge: 'bg-amber-50 text-amber-800 ring-amber-200', dot: 'bg-amber-500' },
  action: { icon: Zap, badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  document: { icon: FileText, badge: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  text: { icon: MessageSquareText, badge: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
}

const GROUP_ICON: Record<GroupId, typeof Zap> = {
  vertrieb: Store,
  auftrag: Headset,
  bestand: Warehouse,
  einkauf: Tags,
  logistik: Truck,
  buchhaltung: Receipt,
}

const origins = (i: Idea) => (Array.isArray(i.origin) ? i.origin : [i.origin])

function TypeBadge({ type }: { type: IdeaType }) {
  const s = TYPE_STYLE[type]
  const Icon = s.icon
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1', s.badge)}>
      <Icon className="size-3.5" /> {TYPES[type].label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Landkarte                                                            */
/* ------------------------------------------------------------------ */

export function UseCaseMap({ onBack, onOpenDemo, demoNames }: { onBack: () => void; onOpenDemo: (id: string) => void; demoNames: Record<string, string> }) {
  const [group, setGroup] = useState<GroupId | 'all'>('all')
  const [type, setType] = useState<IdeaType | 'all'>('all')
  const [open, setOpen] = useState<Idea | null>(null)

  const visible = IDEAS.filter((i) => (group === 'all' || i.group === group) && (type === 'all' || i.type === type))
  const counts = (Object.keys(TYPES) as IdeaType[]).map((t) => ({ t, n: IDEAS.filter((i) => i.type === t).length }))

  const openIdea = (i: Idea) => (i.related ? onOpenDemo(i.related) : setOpen(i))

  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-2">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-500 hover:bg-white hover:text-slate-800">
          <ArrowLeft className="size-4" /> Zurück zur Demo
        </button>
      </div>

      <div className="mt-1 text-center">
        <div className="text-sm font-semibold tracking-[0.14em] text-brand-600 uppercase">Use-Case-Landkarte</div>
        <h2 className="mt-1 text-[2.1rem] font-semibold tracking-tight text-slate-900">{IDEAS.length} Ideen aus den Fachbereichen</h2>
        <p className="mx-auto mt-1 max-w-3xl text-[1.05rem] text-slate-500">
          Alle folgen demselben Muster wie die Live-Demo. Ein Klick zeigt, wie ein Agent die Aufgabe in sieben Schritten erledigen könnte.
        </p>
      </div>

      {/* Was ist möglich? – nach Art der KI-Unterstützung */}
      <div className="mx-auto mt-6 grid w-full max-w-6xl grid-cols-2 gap-3 md:grid-cols-5">
        {counts.map(({ t, n }) => {
          const s = TYPE_STYLE[t]
          const Icon = s.icon
          const active = type === t
          return (
            <button
              key={t}
              onClick={() => setType(active ? 'all' : t)}
              className={cx('rounded-2xl border bg-white px-4 py-3 text-left transition', active ? 'border-slate-400 ring-2 ring-slate-200' : 'border-slate-200 hover:border-slate-300')}
            >
              <div className="flex items-center gap-2">
                <span className={cx('grid size-8 place-items-center rounded-lg ring-1', s.badge)}>
                  <Icon className="size-4.5" />
                </span>
                <span className="text-2xl font-semibold text-slate-900 tabular">{n}</span>
                <span className="font-semibold text-slate-700">{TYPES[t].label}</span>
              </div>
              <div className="mt-1 text-[0.82rem] leading-snug text-slate-500">{TYPES[t].hint}</div>
            </button>
          )
        })}
      </div>

      {/* Fachbereich-Filter */}
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {[{ id: 'all' as const, label: 'Alle Bereiche' }, ...GROUPS].map((g) => (
          <button
            key={g.id}
            onClick={() => setGroup(g.id)}
            className={cx('rounded-full px-3.5 py-1.5 text-sm font-semibold transition', group === g.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50')}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-7 pb-8">
        {GROUPS.map((g) => {
          const list = visible.filter((i) => i.group === g.id)
          if (!list.length) return null
          const GIcon = GROUP_ICON[g.id]
          return (
            <section key={g.id}>
              <div className="mb-3 flex items-center gap-2">
                <GIcon className="size-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-slate-800">{g.label}</h3>
                <span className="text-sm text-slate-400">{list.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {list.map((i) => (
                  <motion.button
                    layout
                    key={i.id}
                    onClick={() => openIdea(i)}
                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_8px_24px_-12px_rgb(31_74_112/0.4)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <TypeBadge type={i.type} />
                      {i.related && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                          <PlayCircle className="size-3.5" /> Live-Demo
                        </span>
                      )}
                    </div>
                    <div className="mt-3 text-[1.02rem] leading-snug font-semibold text-slate-900">{i.title}</div>
                    <div className="mt-1.5 text-[0.86rem] leading-snug text-slate-500">
                      <span className="font-semibold text-slate-400">Worum geht's? </span>
                      {i.context}
                    </div>
                    <div className="mt-1.5 text-[0.9rem] leading-snug text-slate-800">
                      <span className="font-semibold text-brand-600">Mit KI: </span>
                      {i.short}
                    </div>
                    <div className="mt-auto pt-3 text-sm font-semibold text-brand-600 opacity-80 group-hover:opacity-100">
                      {i.related ? `→ ${demoNames[i.related]} öffnen` : '→ Agent ansehen'}
                    </div>
                  </motion.button>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <AnimatePresence>{open && <IdeaAgent idea={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mini-Agent: die sieben Schritte in je einem Satz                     */
/* ------------------------------------------------------------------ */

function IdeaAgent({ idea, onClose }: { idea: Idea; onClose: () => void }) {
  // step = Anzahl erledigter Schritte (0 … 7)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const steps = idea.steps!
  const done = step >= 7

  useEffect(() => {
    if (!playing) return
    if (done) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 400 : 1700)
    return () => window.clearTimeout(t)
  }, [playing, step, done])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' || e.key === 'PageDown') setStep((s) => Math.min(7, s + 1))
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') setStep((s) => Math.max(0, s - 1))
      else if (e.code === 'Space') {
        e.preventDefault()
        setPlaying((p) => !p)
      } else return
      e.stopPropagation()
    }
    window.addEventListener('keydown', k, true)
    return () => window.removeEventListener('keydown', k, true)
  }, [onClose])

  const result = idea.result
  const showResult = step >= 4 // ab „Verarbeiten“
  const showWarn = step >= 5 // ab „Prüfen“

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="thin-scroll flex max-h-full w-full max-w-6xl flex-col overflow-y-auto rounded-3xl bg-canvas shadow-2xl"
      >
        {/* Kopf */}
        <div className="flex items-start gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={idea.type} />
              <span className="text-sm text-slate-400">{GROUPS.find((g) => g.id === idea.group)!.label}</span>
            </div>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{idea.title}</h3>
            <p className="mt-1.5 max-w-4xl text-[1rem] leading-snug text-slate-700">
              <span className="font-semibold text-slate-500">Worum geht's? </span>
              {idea.context}
            </p>
            <p className="mt-1 text-[0.88rem] text-slate-400">
              <span className="font-semibold">Aus dem Fachbereich: </span>
              {origins(idea).map((o, k) => (
                <span key={k} className="italic">
                  {k > 0 && ' · '}„{o}“
                </span>
              ))}
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Schließen">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
          {/* Sieben Schritte */}
          <div>
            <ol className="space-y-1.5">
              {PHASES.map((ph, i) => {
                const Icon = ICONS[ph.icon]
                const isDone = step > i
                const isCurrent = step === i + 1
                const human = ph.id === 'freigabe'
                return (
                  <li key={ph.id}>
                    <button
                      onClick={() => setStep(i + 1)}
                      className={cx(
                        'flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-300',
                        isCurrent && !human && 'border-brand-300 bg-white shadow-sm ring-2 ring-brand-100',
                        isCurrent && human && 'border-human-300 bg-human-50 shadow-sm ring-2 ring-human-200',
                        !isCurrent && isDone && 'border-slate-200 bg-white',
                        !isDone && 'border-transparent opacity-45 hover:opacity-70',
                      )}
                    >
                      <span
                        className={cx(
                          'relative mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg',
                          isDone ? (human ? 'bg-human-600 text-white' : 'bg-brand-600 text-white') : 'bg-slate-200 text-slate-500',
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className={cx('block text-[0.68rem] font-bold tracking-[0.08em] uppercase', human ? 'text-human-600' : 'text-slate-400')}>{ph.label}</span>
                        <span className="block text-[0.98rem] leading-snug font-medium text-slate-800">{steps[i]}</span>
                      </span>
                      {isDone && <Check className={cx('mt-1 ml-auto size-4 shrink-0', human ? 'text-human-600' : 'text-emerald-600')} />}
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40" aria-label="Zurück">
                <ArrowLeft className="size-4" />
              </button>
              {done ? (
                <button onClick={() => { setStep(0); setPlaying(true) }} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">
                  <RotateCcw className="size-4" /> Nochmal
                </button>
              ) : (
                <button onClick={() => setPlaying((p) => !p)} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white hover:bg-brand-700">
                  {playing ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />} {playing ? 'Pause' : step === 0 ? 'Abspielen' : 'Fortsetzen'}
                </button>
              )}
              <button onClick={() => setStep((s) => Math.min(7, s + 1))} disabled={done} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                Schritt <ArrowRight className="size-4" />
              </button>
              <span className="ml-auto text-sm text-slate-400 tabular">{step}/7</span>
            </div>
          </div>

          {/* Beispiel-Ergebnis */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Beispiel-Ergebnis · {idea.resultTitle}</span>
              {done && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  <Check className="size-3" /> freigegeben
                </span>
              )}
            </div>
            {!showResult || !result ? (
              <div className="mt-4 grid flex-1 place-items-center rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-400">
                Das Ergebnis entsteht ab dem Schritt „Verarbeiten“.
              </div>
            ) : result.kind === 'table' ? (
              <motion.table initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 w-full text-[0.98rem]">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-400 uppercase">
                    {result.columns.map((c, ci) => (
                      <th key={c} className={cx('py-2 pr-3 font-semibold', ci > 0 && result.columns.length > 3 && 'text-right')}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, ri) => {
                    const warn = r.warn && showWarn
                    return (
                      <tr key={ri} className={cx('border-b border-slate-100 transition-colors duration-500', warn && 'bg-amber-50')}>
                        {r.cells.map((c, ci) => (
                          <td
                            key={ci}
                            className={cx(
                              'py-2.5 pr-3',
                              ci === 0 ? 'font-medium text-slate-800' : 'text-slate-600',
                              ci > 0 && result.columns.length > 3 && 'tabular text-right',
                              warn && ci === r.cells.length - 1 && 'font-semibold text-amber-700',
                            )}
                          >
                            {warn && ci === r.cells.length - 1 && <TriangleAlert className="mr-1 inline size-3.5 align-[-2px]" />}
                            {c}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </motion.table>
            ) : (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-2 gap-3">
                {result.items.map((k) => {
                  const warn = k.warn && showWarn
                  return (
                    <div key={k.label} className={cx('rounded-xl border px-4 py-3 transition-colors duration-500', warn ? 'border-amber-200 bg-amber-50/70' : 'border-slate-200')}>
                      <div className={cx('text-2xl font-semibold tabular', warn ? 'text-amber-700' : 'text-slate-900')}>{k.value}</div>
                      <div className="text-sm text-slate-500">{k.label}</div>
                    </div>
                  )
                })}
              </motion.div>
            )}
            {idea.note && <div className="mt-3 text-sm text-slate-500">{idea.note}</div>}
            <div className="mt-auto pt-4 text-xs text-slate-400">Beispieldaten · keine echten Zahlen</div>
            {step === 6 && (
              <div className="mt-3 rounded-xl bg-human-50 px-3 py-2 text-sm font-medium text-human-700">Automatisieren, wo es sinnvoll ist. Prüfen, wo es wichtig ist.</div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
