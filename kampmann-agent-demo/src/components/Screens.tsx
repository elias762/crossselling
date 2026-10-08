import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Map as MapIcon, ArrowLeft, ArrowRight, BrainCircuit, ClipboardCheck, Layers, Lightbulb, Plus, Search, Trash2, Wrench, X } from 'lucide-react'
import type { Recap, ScenarioDef } from '../engine/types'
import { ICONS } from './icons'
import { PHASES } from './phases'
import { cx } from './ui'
import logoUrl from '../assets/kampmann-logo.png'

/* ------------------------------------------------------------------ */
/* Startscreen                                                          */
/* ------------------------------------------------------------------ */

export function StartScreen({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault()
        onStart()
      }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onStart])

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_-10%,var(--color-brand-100),transparent)]" />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative max-w-5xl">
        <img src={logoUrl} alt="Kampmann & Co. – Ihr Gastronomiepartner" className="mx-auto mb-8 h-28 w-auto rounded-2xl shadow-lg" />
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-500">
          KI-Workshop · Interaktiver Demonstrator · Beispieldaten
        </div>
        <h1 className="text-[2.6rem] leading-[1.12] font-semibold tracking-tight text-balance text-slate-900 md:text-[3.4rem]">
          Was passiert eigentlich, wenn ein KI-Agent einen Geschäftsprozess übernimmt?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-500">Wählen wir ein Beispiel aus dem Kampmann-Arbeitsalltag.</p>
        <button
          onClick={onStart}
          className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-900/15 transition hover:bg-brand-700 focus-visible:ring-4 focus-visible:ring-brand-200 focus-visible:outline-none"
        >
          Demo starten <ArrowRight className="size-5" />
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="relative mt-16 flex max-w-full flex-wrap items-center justify-center gap-2">
        {PHASES.map((ph, i) => {
          const Icon = ICONS[ph.icon]
          return (
            <motion.span
              key={ph.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.12 }}
              className="inline-flex items-center gap-2"
            >
              {i > 0 && <ArrowRight className="size-4 text-slate-300" />}
              <span className={cx('inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-sm font-semibold', ph.id === 'freigabe' ? 'border-human-200 text-human-700' : 'border-slate-200 text-slate-600')}>
                <Icon className="size-4" /> {ph.label}
              </span>
            </motion.span>
          )
        })}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Abschlussbild                                                        */
/* ------------------------------------------------------------------ */

export const CAPABILITIES: { key: keyof Recap; title: string; text: string; icon: typeof Search; question: string; example: string }[] = [
  { key: 'verstehen', title: 'Verstehen', text: 'Informationen aus Sprache, Dokumenten oder Tabellen erfassen', icon: BrainCircuit, question: 'Wo lesen, hören oder tippen wir heute Informationen ab?', example: 'z. B. Anrufe, Kunden-E-Mails, Lieferantenschreiben' },
  { key: 'suchen', title: 'Suchen', text: 'Relevante Unternehmensinformationen finden', icon: Search, question: 'Wo suchen wir regelmäßig in Systemen, Ordnern oder Postfächern?', example: 'z. B. Lieferscheine, Bestellhistorie, Stammdaten' },
  { key: 'strukturieren', title: 'Strukturieren', text: 'Unstrukturierte Daten in verwertbare Informationen überführen', icon: Layers, question: 'Wo übertragen wir Inhalte von A nach B – E-Mail, Excel, ERP?', example: 'z. B. Gesprächsnotizen, Preislisten, Excel-Dateien' },
  { key: 'handeln', title: 'Handeln', text: 'Arbeitsschritte in Systemen vorbereiten oder ausführen', icon: Wrench, question: 'Welche Routineschritte wiederholen sich täglich oder wöchentlich?', example: 'z. B. Preise pflegen, Dokumente versenden' },
  { key: 'pruefen', title: 'Prüfen', text: 'Ergebnisse kontrollieren und Ausnahmen an Menschen übergeben', icon: ClipboardCheck, question: 'Wo gleichen wir Listen ab oder suchen nach Fehlern und Lücken?', example: 'z. B. fehlende Preise, Umsatzabgleiche' },
]

export function RecapScreen({ scenario, next, onClose, onNext, onBoard, onMap, ideaCount }: { scenario: ScenarioDef; next?: ScenarioDef; onClose: () => void; onNext: () => void; onBoard: () => void; onMap: () => void; ideaCount: number }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'ArrowLeft') onClose()
      if (e.key === 'ArrowRight') onBoard()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose, onBoard])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="thin-scroll fixed inset-0 z-40 overflow-y-auto bg-canvas">
      <div className="mx-auto flex min-h-full max-w-[110rem] flex-col px-8 py-8">
        <div className="flex items-center justify-between">
          <button onClick={onClose} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-500 hover:bg-white hover:text-slate-800">
            <ArrowLeft className="size-4" /> Zurück zur Demo
          </button>
          <span className="text-sm text-slate-400">Am Beispiel: {scenario.name}</span>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white hover:text-slate-700" aria-label="Schließen">
            <X className="size-5" />
          </button>
        </div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center text-[2.4rem] font-semibold tracking-tight text-slate-900">
          Was hat die KI hier eigentlich gemacht?
        </motion.h2>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-5">
          {CAPABILITIES.map((c, i) => {
            const Icon = c.icon
            const human = c.key === 'pruefen'
            return (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className={cx('flex flex-col rounded-3xl border bg-white p-6', human ? 'border-human-200' : 'border-slate-200')}
              >
                <span className={cx('grid size-14 place-items-center rounded-2xl', human ? 'bg-human-100 text-human-700' : 'bg-brand-50 text-brand-700')}>
                  <Icon className="size-7" />
                </span>
                <div className="mt-5 text-[1.6rem] font-bold tracking-wide text-slate-900 uppercase">{c.title}</div>
                <div className="mt-2 min-h-[4.2rem] text-[1.05rem] leading-snug text-slate-600">{c.text}</div>
                <div className="mt-auto pt-5">
                  <div className={cx('rounded-2xl px-4 py-3', human ? 'bg-human-50' : 'bg-brand-50/70')}>
                    <div className="text-[0.7rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">In diesem Beispiel</div>
                    <div className="mt-1 text-[0.98rem] leading-snug font-medium text-slate-800">{scenario.recap[c.key]}</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-12 flex flex-col items-center text-center">
          <p className="max-w-3xl text-[1.05rem] text-slate-500">
            KI übernimmt nicht zwangsläufig den gesamten Prozess. Sie kann einzelne Arbeitsschritte vorbereiten, Informationen zusammenführen und Mitarbeitende bei Entscheidungen unterstützen.
          </p>
          <h3 className="mt-6 text-[2rem] font-semibold tracking-tight text-slate-900">Wo finden wir solche Arbeitsschritte heute bei Kampmann?</h3>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button onClick={onBoard} className="inline-flex items-center gap-3 rounded-2xl bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-900/15 transition hover:bg-brand-700">
              <Lightbulb className="size-5" /> Eigene Potenziale entdecken
            </button>
            {next && (
              <button onClick={onNext} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-lg font-semibold text-slate-700 transition hover:bg-slate-50">
                Nächstes Beispiel: {next.name} <ArrowRight className="size-5" />
              </button>
            )}
          </div>
          <button onClick={onMap} className="mt-4 inline-flex items-center gap-2 text-[1rem] font-semibold text-brand-600 hover:text-brand-800">
            <MapIcon className="size-4" /> {ideaCount} weitere Ideen aus den Fachbereichen ansehen
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Potenzial-Board: Brücke in den interaktiven Workshop                 */
/* ------------------------------------------------------------------ */

type Notes = Record<string, { id: number; text: string }[]>
const STORE_KEY = 'kampmann-potenzial-board'

function loadNotes(): Notes {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? (JSON.parse(raw) as Notes) : {}
  } catch {
    return {}
  }
}

const NOTE_COLORS = ['bg-amber-100 border-amber-200', 'bg-sky-100 border-sky-200', 'bg-emerald-100 border-emerald-200', 'bg-rose-100 border-rose-200', 'bg-violet-100 border-violet-200']

export function PotentialBoard({ onBack }: { onBack: () => void }) {
  const [notes, setNotes] = useState<Notes>(loadNotes)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(notes))
    } catch {
      /* z. B. privater Modus – Board funktioniert trotzdem */
    }
  }, [notes])

  const add = (key: string) => {
    const text = (drafts[key] ?? '').trim()
    if (!text) return
    setNotes((n) => ({ ...n, [key]: [...(n[key] ?? []), { id: Date.now(), text }] }))
    setDrafts((d) => ({ ...d, [key]: '' }))
  }
  const remove = (key: string, id: number) => setNotes((n) => ({ ...n, [key]: (n[key] ?? []).filter((x) => x.id !== id) }))
  const total = Object.values(notes).reduce((s, l) => s + l.length, 0)

  return (
    <div className="thin-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-2">
      <div className="flex flex-wrap items-end gap-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-500 hover:bg-white hover:text-slate-800">
          <ArrowLeft className="size-4" /> Zurück zur Demo
        </button>
        <div className="flex-1" />
        {total > 0 && (
          <button
            onClick={() => window.confirm('Alle Notizen vom Board entfernen?') && setNotes({})}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 hover:bg-white hover:text-rose-600"
          >
            <Trash2 className="size-4" /> Board leeren
          </button>
        )}
      </div>
      <div className="mt-2 text-center">
        <div className="text-sm font-semibold tracking-[0.14em] text-brand-600 uppercase">Potenzial-Board</div>
        <h2 className="mt-1 text-[2.2rem] font-semibold tracking-tight text-slate-900">Wo finden wir solche Arbeitsschritte heute bei Kampmann?</h2>
        <p className="mt-2 text-lg text-slate-500">Sammeln Sie Tätigkeiten aus Ihrem Alltag – sortiert nach dem, was ein KI-Agent dabei übernehmen könnte.</p>
      </div>

      <div className="mt-8 grid flex-1 grid-cols-1 gap-4 pb-6 md:grid-cols-5">
        {CAPABILITIES.map((c, ci) => {
          const Icon = c.icon
          const list = notes[c.key] ?? []
          return (
            <div key={c.key} className="flex min-h-[22rem] flex-col rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="size-5" />
                </span>
                <span className="text-lg font-bold tracking-wide text-slate-900 uppercase">{c.title}</span>
              </div>
              <p className="mt-3 text-[0.98rem] leading-snug font-medium text-slate-700">{c.question}</p>
              <p className="mt-1 text-xs text-slate-400">
                {c.example}
              </p>
              <div className="mt-3 flex-1 space-y-2">
                {list.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
                    animate={{ opacity: 1, scale: 1, rotate: i % 2 ? 0.6 : -0.6 }}
                    className={cx('group relative rounded-lg border px-3 py-2 text-[0.95rem] text-slate-800 shadow-sm', NOTE_COLORS[ci % NOTE_COLORS.length])}
                  >
                    {n.text}
                    <button onClick={() => remove(c.key, n.id)} className="absolute top-1 right-1 hidden rounded p-0.5 text-slate-500 group-hover:block hover:bg-white/60" aria-label="Notiz entfernen">
                      <X className="size-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
              <form
                className="mt-3 flex gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault()
                  add(c.key)
                }}
              >
                <input
                  value={drafts[c.key] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [c.key]: e.target.value }))}
                  placeholder="Tätigkeit ergänzen …"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
                />
                <button type="submit" className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-600 text-white hover:bg-brand-700" aria-label="Hinzufügen">
                  <Plus className="size-4" />
                </button>
              </form>
            </div>
          )
        })}
      </div>
    </div>
  )
}
