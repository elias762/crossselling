import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ChevronUp, Clock, Download, HardDrive, Lightbulb, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { cx, toast } from './ui'

/* ------------------------------------------------------------------ */
/* Potenzial-Board: manuelle, wiederkehrende Aufgaben sammeln,          */
/* Zeitaufwand abschätzen und gemeinsam priorisieren.                   */
/* Gespeichert wird lokal im Browser – Export als CSV für Excel.         */
/* ------------------------------------------------------------------ */

const AREAS = [
  { id: 'vertrieb', label: 'Vertrieb' },
  { id: 'kundenservice', label: 'Kundenservice' },
  { id: 'bestand', label: 'Bestand / WWS' },
  { id: 'einkauf', label: 'Einkauf' },
  { id: 'logistik', label: 'Logistik' },
  { id: 'buchhaltung', label: 'Buchhaltung' },
  { id: 'sonstiges', label: 'Sonstiges' },
] as const
type AreaId = (typeof AREAS)[number]['id']

const FREQS = [
  { id: 'taeglich', label: 'täglich', perYear: 220 },
  { id: 'woechentlich', label: 'wöchentlich', perYear: 46 },
  { id: 'monatlich', label: 'monatlich', perYear: 12 },
  { id: 'quartal', label: 'quartalsweise', perYear: 4 },
] as const
type FreqId = (typeof FREQS)[number]['id']

const MINUTES = [
  { v: 5, label: '5 Min' },
  { v: 15, label: '15 Min' },
  { v: 30, label: '30 Min' },
  { v: 60, label: '1 Std' },
  { v: 120, label: '2 Std +' },
]

const KINDS = [
  { id: 'abtippen', label: 'Abtippen & Übertragen', ki: 'KI liest und überträgt die Daten' },
  { id: 'suchen', label: 'Suchen & Zusammentragen', ki: 'KI findet die Informationen' },
  { id: 'abgleichen', label: 'Abgleichen & Kontrollieren', ki: 'KI prüft und meldet Abweichungen' },
  { id: 'auswerten', label: 'Listen & Auswertungen', ki: 'KI erstellt die Auswertung' },
  { id: 'schreiben', label: 'Mails & Texte schreiben', ki: 'KI schreibt den Entwurf' },
] as const
type KindId = (typeof KINDS)[number]['id']

const PROMPTS = [
  'Was machen Sie jede Woche auf die gleiche Weise?',
  'Wo tippen Sie Daten von einem System ins andere ab?',
  'Wo suchen Sie Informationen aus mehreren Quellen zusammen?',
  'Welche Listen gleichen Sie regelmäßig von Hand ab?',
  'Welche Mails beantworten Sie immer wieder ähnlich?',
  'Was kostet Zeit – macht aber keinen Spaß?',
]

interface Task {
  id: number
  text: string
  area: AreaId | ''
  freq: FreqId | ''
  minutes: number
  kinds: KindId[]
  votes: number
}

const STORE_KEY = 'kampmann-potenzial-tasks-v2'
const OLD_KEY = 'kampmann-potenzial-board'

const hoursPerYear = (t: Pick<Task, 'freq' | 'minutes'>) => {
  const f = FREQS.find((x) => x.id === t.freq)
  return f && t.minutes ? Math.round((f.perYear * t.minutes) / 60) : 0
}

function level(h: number) {
  if (h >= 50) return { label: 'hoch', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
  if (h >= 15) return { label: 'mittel', cls: 'bg-amber-50 text-amber-800 ring-amber-200' }
  return { label: 'gering', cls: 'bg-slate-100 text-slate-500 ring-slate-200' }
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw) as Task[]
    // Einträge aus der früheren Board-Version übernehmen
    const old = localStorage.getItem(OLD_KEY)
    if (old) {
      const map: Record<string, KindId> = { verstehen: 'abtippen', suchen: 'suchen', strukturieren: 'abtippen', handeln: 'schreiben', pruefen: 'abgleichen' }
      const notes = JSON.parse(old) as Record<string, { id: number; text: string }[]>
      return Object.entries(notes).flatMap(([k, list]) =>
        list.map((n) => ({ id: n.id, text: n.text, area: '' as const, freq: '' as const, minutes: 0, kinds: map[k] ? [map[k]] : [], votes: 0 })),
      )
    }
  } catch {
    /* z. B. privater Modus – Board funktioniert trotzdem, nur ohne Speicherung */
  }
  return []
}

const EXAMPLES: Omit<Task, 'id'>[] = [
  { text: 'Bestellungen aus Mails ins WWS abtippen', area: 'kundenservice', freq: 'taeglich', minutes: 30, kinds: ['abtippen'], votes: 0 },
  { text: 'Lieferscheine für Kunden heraussuchen und verschicken', area: 'kundenservice', freq: 'taeglich', minutes: 15, kinds: ['suchen', 'schreiben'], votes: 0 },
  { text: 'Monatliche Tour-Auswertung in Excel zusammenstellen', area: 'logistik', freq: 'monatlich', minutes: 120, kinds: ['auswerten'], votes: 0 },
]

function downloadCsv(tasks: Task[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const head = ['Aufgabe', 'Bereich', 'Häufigkeit', 'Minuten je Durchgang', 'Stunden pro Jahr (Schätzung)', 'Was ist mühsam?', 'Stimmen']
  const rows = tasks.map((t) => [
    t.text,
    AREAS.find((a) => a.id === t.area)?.label ?? '',
    FREQS.find((f) => f.id === t.freq)?.label ?? '',
    t.minutes || '',
    hoursPerYear(t) || '',
    t.kinds.map((k) => KINDS.find((x) => x.id === k)!.label).join(', '),
    t.votes,
  ])
  const csv = '﻿' + [head, ...rows].map((r) => r.map(esc).join(';')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `Potenzial-Board_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-full px-3 py-1.5 text-[0.88rem] font-semibold transition',
        active ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300',
      )}
    >
      {children}
    </button>
  )
}

export function PotentialBoard({ onBack }: { onBack: () => void }) {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [text, setText] = useState('')
  const [area, setArea] = useState<AreaId | ''>('')
  const [freq, setFreq] = useState<FreqId | ''>('')
  const [minutes, setMinutes] = useState(0)
  const [kinds, setKinds] = useState<KindId[]>([])
  const [sort, setSort] = useState<'votes' | 'hours'>('votes')
  const [prompt, setPrompt] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(tasks))
    } catch {
      /* Speichern nicht möglich – Board funktioniert trotzdem */
    }
  }, [tasks])

  // Impulsfragen wechseln langsam durch
  useEffect(() => {
    const t = window.setInterval(() => setPrompt((p) => (p + 1) % PROMPTS.length), 7000)
    return () => window.clearInterval(t)
  }, [])

  const add = () => {
    const t = text.trim()
    if (!t) {
      inputRef.current?.focus()
      return
    }
    setTasks((list) => [{ id: Date.now(), text: t, area, freq, minutes, kinds, votes: 0 }, ...list])
    setText('')
    setArea('')
    setFreq('')
    setMinutes(0)
    setKinds([])
    inputRef.current?.focus()
  }

  const vote = (id: number, d: number) => setTasks((list) => list.map((t) => (t.id === id ? { ...t, votes: Math.max(0, t.votes + d) } : t)))
  const remove = (id: number) => setTasks((list) => list.filter((t) => t.id !== id))

  // Beim Abstimmen nicht sofort umsortieren (sonst springen die Karten unter dem Mauszeiger weg),
  // sondern kurz nach der letzten Stimme.
  const voteSignature = tasks.map((t) => t.votes).join(',')
  const [resort, setResort] = useState(0)
  useEffect(() => {
    const t = window.setTimeout(() => setResort((r) => r + 1), 1500)
    return () => window.clearTimeout(t)
  }, [voteSignature])
  const order = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => (sort === 'votes' ? b.votes - a.votes || hoursPerYear(b) - hoursPerYear(a) : hoursPerYear(b) - hoursPerYear(a) || b.votes - a.votes))
        .map((t) => t.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resort, sort, tasks.length],
  )
  const sorted = order.map((id) => tasks.find((t) => t.id === id)).filter((t): t is Task => !!t)
  const totalHours = tasks.reduce((s, t) => s + hoursPerYear(t), 0)
  const topKind = useMemo(() => {
    const c = new Map<KindId, number>()
    tasks.forEach((t) => t.kinds.forEach((k) => c.set(k, (c.get(k) ?? 0) + 1)))
    const best = [...c.entries()].sort((a, b) => b[1] - a[1])[0]
    return best ? KINDS.find((k) => k.id === best[0])!.label : '–'
  }, [tasks])

  const preview = hoursPerYear({ freq, minutes })

  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-2">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-500 hover:bg-white hover:text-slate-800">
          <ArrowLeft className="size-4" /> Zurück zur Demo
        </button>
        <div className="flex-1" />
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400" title="Die Einträge bleiben in diesem Browser auf diesem Gerät erhalten – auch nach dem Neuladen. Für die Weitergabe bitte exportieren.">
          <HardDrive className="size-3.5" /> wird automatisch in diesem Browser gespeichert
        </span>
        <button
          onClick={() => (tasks.length ? downloadCsv(tasks) : toast('Noch keine Aufgaben erfasst.'))}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Download className="size-4" /> Export für Excel
        </button>
        {tasks.length > 0 && (
          <button
            onClick={() => window.confirm('Alle erfassten Aufgaben löschen?') && setTasks([])}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-white hover:text-rose-600"
          >
            <Trash2 className="size-4" /> Leeren
          </button>
        )}
      </div>

      <div className="mt-1 text-center">
        <div className="text-sm font-semibold tracking-[0.14em] text-brand-600 uppercase">Potenzial-Board</div>
        <h2 className="mt-1 text-[2.1rem] font-semibold tracking-tight text-slate-900">Welche manuellen, wiederkehrenden Aufgaben kosten Sie heute Zeit?</h2>
        <div className="mx-auto mt-2 flex h-8 max-w-3xl items-center justify-center gap-2 text-lg text-slate-500">
          <Lightbulb className="size-5 shrink-0 text-amber-500" />
          <AnimatePresence mode="wait">
            <motion.span key={prompt} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
              {PROMPTS[prompt]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-6 grid flex-1 gap-5 pb-6 xl:grid-cols-[minmax(0,34rem)_1fr]">
        {/* Erfassen */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
          className="h-fit rounded-3xl border border-slate-200 bg-white p-5"
        >
          <label className="block text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Aufgabe</label>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="z. B. Lieferscheine aus Mails ins System abtippen"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[1.05rem] outline-none focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
          />

          <div className="mt-4 text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Bereich</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {AREAS.map((a) => (
              <Chip key={a.id} active={area === a.id} onClick={() => setArea(area === a.id ? '' : a.id)}>
                {a.label}
              </Chip>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Wie oft?</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {FREQS.map((f) => (
                  <Chip key={f.id} active={freq === f.id} onClick={() => setFreq(freq === f.id ? '' : f.id)}>
                    {f.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Wie lange jeweils?</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {MINUTES.map((m) => (
                  <Chip key={m.v} active={minutes === m.v} onClick={() => setMinutes(minutes === m.v ? 0 : m.v)}>
                    {m.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Was macht die Aufgabe mühsam?</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {KINDS.map((k) => (
              <Chip key={k.id} active={kinds.includes(k.id)} onClick={() => setKinds((list) => (list.includes(k.id) ? list.filter((x) => x !== k.id) : [...list, k.id]))}>
                {k.label}
              </Chip>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-700">
              <Plus className="size-4.5" /> Aufgabe hinzufügen
            </button>
            {preview > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[0.95rem] text-slate-500">
                <Clock className="size-4" /> heute ca. <span className="font-semibold text-slate-800">{preview} Std. pro Jahr</span>
              </span>
            )}
          </div>
          {kinds.length > 0 && (
            <div className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-[0.9rem] text-brand-800">
              <Sparkles className="mr-1.5 inline size-4 align-[-3px]" />
              {KINDS.filter((k) => kinds.includes(k.id))
                .map((k) => k.ki)
                .join(' · ')}
            </div>
          )}
        </form>

        {/* Gesammelte Aufgaben */}
        <div className="min-w-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-3xl font-semibold text-slate-900 tabular">{tasks.length}</div>
              <div className="text-sm text-slate-500">Aufgaben gesammelt</div>
            </div>
            <div className="rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-3">
              <div className="text-3xl font-semibold text-brand-700 tabular">≈ {totalHours.toLocaleString('de-DE')}</div>
              <div className="text-sm text-slate-500">Std. pro Jahr heute (Schätzung)</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="truncate text-xl leading-9 font-semibold text-slate-900">{topKind}</div>
              <div className="text-sm text-slate-500">häufigste Art</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-slate-400">Sortieren:</span>
            {[
              { id: 'votes' as const, label: 'nach Stimmen' },
              { id: 'hours' as const, label: 'nach Zeitaufwand' },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setSort(o.id)}
                className={cx('rounded-lg px-2.5 py-1 text-sm font-semibold', sort === o.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-white')}
              >
                {o.label}
              </button>
            ))}
            <span className="ml-auto text-sm text-slate-400">Mit ▲ abstimmen: Was sollten wir zuerst angehen?</span>
          </div>

          <div className="mt-3 space-y-2">
            {tasks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-400">
                Noch keine Aufgaben. Links die erste Aufgabe eintragen.
                <div className="mt-3">
                  <button
                    onClick={() => setTasks(EXAMPLES.map((e, i) => ({ ...e, id: Date.now() + i })))}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-800"
                  >
                    Beispiele einfügen, um das Board zu zeigen
                  </button>
                </div>
              </div>
            )}
            <AnimatePresence initial={false}>
              {sorted.map((t) => {
                const h = hoursPerYear(t)
                const lv = level(h)
                const f = FREQS.find((x) => x.id === t.freq)
                const a = AREAS.find((x) => x.id === t.area)
                return (
                  <motion.div
                    layout
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="group flex items-stretch gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50">
                      <button onClick={() => vote(t.id, 1)} className="rounded-md p-1 text-slate-400 hover:bg-brand-50 hover:text-brand-600" aria-label="Stimme geben">
                        <ChevronUp className="size-5" strokeWidth={2.5} />
                      </button>
                      <span className="text-lg leading-none font-semibold text-slate-800 tabular">{t.votes}</span>
                      <button onClick={() => vote(t.id, -1)} className="mt-0.5 text-[0.7rem] text-slate-300 hover:text-slate-500" aria-label="Stimme zurücknehmen">
                        −
                      </button>
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="text-[1.05rem] leading-snug font-semibold text-slate-900">{t.text}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.86rem] text-slate-500">
                        {a && <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{a.label}</span>}
                        {f && t.minutes > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" /> {f.label} · {MINUTES.find((m) => m.v === t.minutes)?.label}
                          </span>
                        )}
                        {t.kinds.map((k) => (
                          <span key={k} className="text-brand-700" title={KINDS.find((x) => x.id === k)!.ki}>
                            {KINDS.find((x) => x.id === k)!.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end justify-between">
                      <button onClick={() => remove(t.id)} className="rounded-md p-1 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-600" aria-label="Aufgabe entfernen">
                        <X className="size-4" />
                      </button>
                      {h > 0 && (
                        <div className="text-right">
                          <div className="text-[1.05rem] font-semibold text-slate-800 tabular">≈ {h} Std./Jahr</div>
                          <span className={cx('mt-0.5 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ring-1', lv.cls)}>Zeitpotenzial {lv.label}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          {tasks.length > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              Schätzung: Häufigkeit × Dauer (täglich = 220 Arbeitstage, wöchentlich = 46 Wochen). Zeigt den heutigen Aufwand – nicht die Ersparnis.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
