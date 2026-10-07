import { memo } from 'react'
import { Database, Download, FileWarning, TriangleAlert } from 'lucide-react'
import type { ScenarioDef, ScenarioProps } from '../engine/types'
import { Badge, Label, Panel, Placeholder, Reveal, StatTile, SystemChip, chipState, cx, toast, useTween } from '../components/ui'

const TOTAL = 1842
const COLS = 74

// 28 deterministisch verteilte Fundstellen – die ersten 3 sind Leergut (0 € ist dort korrekt)
const FOUND = (() => {
  const list: number[] = []
  let x = 7
  while (list.length < 28) {
    x = (x * 1103515245 + 12345) % 2147483648
    const v = x % TOTAL
    if (!list.includes(v)) list.push(v)
  }
  return list
})()
const LEERGUT = new Set(FOUND.slice(0, 3))
const FOUND_SET = new Set(FOUND)

const CATEGORIES = [
  { label: 'Verkaufspreis fehlt', n: 11 },
  { label: 'Preis = 0,00 €', n: 8 },
  { label: 'Einkaufspreis fehlt', n: 6 },
  { label: 'Leergut / Pfand mit 0,00 €', n: 3, ok: true },
]

const EXAMPLES = [
  { nr: '47291', name: 'Weißweinschorle 24 × 0,33 l', issue: 'Verkaufspreis fehlt' },
  { nr: '58120', name: 'Kaffee Crema 1 kg', issue: 'Preis = 0,00 €' },
  { nr: '61022', name: 'Holunderblütensirup 6 × 0,7 l', issue: 'Einkaufspreis fehlt' },
]

const Matrix = memo(function Matrix({ scanned, found, excluded }: { scanned: number; found: boolean; excluded: boolean }) {
  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }} aria-hidden>
      {Array.from({ length: TOTAL }, (_, i) => {
        const done = i < scanned
        const bad = found && FOUND_SET.has(i) && !(excluded && LEERGUT.has(i))
        return (
          <span
            key={i}
            className={cx('aspect-square rounded-[2px] transition-all duration-500', bad ? 'scale-150 bg-amber-500 ring-1 ring-amber-200' : done ? 'bg-brand-300' : 'bg-slate-200')}
          />
        )
      })}
    </div>
  )
})

function Workspace({ p }: ScenarioProps) {
  const scan = useTween(p.reached(2), p.stepMs(2) * 0.85, p.reached(3))
  const scanned = Math.round(TOTAL * scan)
  const found = p.reached(3, 1)
  const excluded = p.reached(4, 1)

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 space-y-4 xl:col-span-4">
        <Panel anchor={0} title="Input · Artikelstamm" icon={<Database className="size-4" />}>
          <SystemChip label="Artikelstamm (Beispieldaten)" state={chipState(p, 0, 1)} icon={<Database className="size-3.5" />} />
          <div className="mt-5">
            <Label>Preisfelder je Artikel</Label>
            <div className="flex flex-wrap gap-1.5">
              {['Einkaufspreis', 'Verkaufspreis', 'Preiseinheit'].map((f, i) => (
                <Badge key={f} tone={p.reached(1, i + 1) ? 'brand' : 'neutral'}>
                  {f}
                </Badge>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <div className="text-[0.95rem] text-slate-500">{p.active(2) && !p.reached(3) ? 'Artikel werden geprüft …' : 'Artikel geprüft'}</div>
            <div className="text-[3.2rem] leading-none font-semibold tracking-tight text-slate-900">
              <span className="tabular">{scanned.toLocaleString('de-DE')}</span>
              <span className="text-2xl font-medium text-slate-400"> / 1.842</span>
            </div>
          </div>
        </Panel>

        {p.reached(3, 2) ? (
          <Reveal show>
            <Panel anchor={3} title="Auffälligkeiten nach Art" icon={<TriangleAlert className="size-4" />}>
              <div className="space-y-3">
                {CATEGORIES.map((c, i) => {
                  const struck = c.ok && excluded
                  return (
                    <Reveal key={c.label} show={p.reached(3, i + 2)}>
                      <div className={cx('transition-opacity duration-500', struck && 'opacity-50')}>
                        <div className="flex items-center justify-between text-[0.95rem]">
                          <span className={cx('text-slate-700', struck && 'line-through')}>{c.label}</span>
                          <span className={cx('font-semibold tabular', struck ? 'text-slate-500' : 'text-amber-700')}>{c.n}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-slate-100">
                          <div className={cx('h-2 rounded-full transition-all duration-700', struck ? 'bg-slate-300' : 'bg-amber-400')} style={{ width: `${(c.n / 11) * 100}%` }} />
                        </div>
                        {struck && <div className="mt-1 text-xs font-medium text-emerald-700">✓ 0 € ist hier korrekt – ausgenommen</div>}
                      </div>
                    </Reveal>
                  )
                })}
              </div>
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Auffälligkeiten · werden nach Art sortiert</Placeholder>
        )}
      </div>

      <div className="col-span-12 xl:col-span-8">
        <Panel
          anchor={2}
          title="Artikelbestand · jedes Kästchen ist ein Artikel"
          aside={
            excluded ? (
              <Badge tone="warn" icon={<TriangleAlert className="size-3" />}>
                25 Artikel zur Prüfung
              </Badge>
            ) : found ? (
              <Badge tone="warn">28 Fundstellen</Badge>
            ) : p.reached(3) ? (
              <Badge tone="ok">vollständig geprüft</Badge>
            ) : undefined
          }
        >
          <Matrix scanned={scanned} found={found} excluded={excluded} />
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px] bg-slate-200" /> noch nicht geprüft
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px] bg-brand-300" /> Preis vollständig
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px] bg-amber-500" /> Preis fehlt oder ungültig
            </span>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function Output({ p }: ScenarioProps) {
  const run = p.reached(6)
  const skip = p.finished
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-amber-500 text-white">
          <FileWarning className="size-5" />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Ergebnisbericht Preisqualität</div>
          <div className="text-xl font-semibold text-slate-900">25 Artikel benötigen Prüfung.</div>
        </div>
        <button
          onClick={() => toast('Demo: Hier würde der Ergebnisbericht als Excel exportiert.')}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Download className="size-4" /> Bericht exportieren
        </button>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatTile value={TOTAL} label="Artikel geprüft" run={run} skip={skip} />
        <StatTile value={1817} label="vollständig" tone="ok" run={run} skip={skip} />
        <StatTile value={25} label="Auffälligkeiten" tone="warn" run={run} skip={skip} />
      </div>
      <ul className="mt-5 divide-y divide-slate-100 text-[0.95rem]">
        {EXAMPLES.map((e) => (
          <li key={e.nr} className="flex items-center gap-3 py-2">
            <span className="font-semibold text-slate-800">Artikel {e.nr}</span>
            <span className="flex-1 text-slate-500">{e.name}</span>
            <Badge tone="warn">{e.issue}</Badge>
          </li>
        ))}
        <li className="py-2 text-sm text-slate-400 italic">… und 22 weitere</li>
      </ul>
    </div>
  )
}

export const qualityScenario: ScenarioDef = {
  id: 'quality',
  name: 'Price Quality Agent',
  subtitle: 'Artikel ohne hinterlegten Preis erkennen',
  origin: 'Fehlende Preise erkennen',
  icon: 'scan',
  source: 'Artikelstamm',
  clockStart: 6 * 3600 + 30 * 60,
  outputTitle: 'Ergebnisbericht',
  next: 'revenue',
  steps: [
    {
      title: 'Artikelstamm laden',
      description: 'Der komplette Artikelbestand wird geladen.',
      insight: 'Ausgangspunkt ist der vollständige Artikelstamm – nicht eine Stichprobe.',
      phase: 'input',
      icon: 'database',
      duration: 2000,
      activities: [
        { text: 'Artikelstamm wird geladen', tone: 'data' },
        { text: '1.842 Artikel geladen', beat: 1, tone: 'success' },
      ],
    },
    {
      title: 'Preisfelder verstehen',
      description: 'Die KI erkennt, welche Felder Preise enthalten.',
      insight: 'Die KI weiß, worauf es ankommt: Einkaufspreis, Verkaufspreis und Preiseinheit.',
      phase: 'verstehen',
      icon: 'table',
      beats: 3,
      duration: 3000,
      activities: [{ text: '3 Preisfelder erkannt', beat: 3, tone: 'success' }],
    },
    {
      title: 'Alle Artikel durchgehen',
      description: 'Jeder einzelne Artikel wird angesehen – in Sekunden statt Stunden.',
      insight: 'Was manuell Stunden dauert, schafft der Agent in Sekunden – und zwar für jeden einzelnen Artikel.',
      phase: 'holen',
      icon: 'scan',
      beats: 2,
      duration: 5000,
      activities: [
        { text: '1.842 Artikel werden geprüft …' },
        { text: 'Alle Artikel geprüft', beat: 2, tone: 'success' },
      ],
    },
    {
      title: 'Auffälligkeiten sortieren',
      description: 'Fehlende und ungültige Preise werden gefunden und nach Art sortiert.',
      insight: 'Aus einer langen Liste wird eine sortierte Übersicht: Wer muss was tun?',
      phase: 'verarbeiten',
      icon: 'tags',
      beats: 5,
      duration: 4500,
      activities: [
        { text: '28 Fundstellen', beat: 1, tone: 'warning' },
        { text: 'Nach Art sortiert', beat: 5, tone: 'success' },
      ],
    },
    {
      title: 'Ausnahmen bewerten',
      description: 'Nicht jeder fehlende Preis ist ein Fehler – Leergut kostet zu Recht 0 €.',
      insight: 'Der Agent unterscheidet echte Fehler von gewollten Ausnahmen – so bleiben nur relevante Fälle übrig.',
      phase: 'pruefen',
      icon: 'clipboard',
      beats: 2,
      duration: 3200,
      activities: [
        { text: '3 Leergut-Artikel: 0 € ist korrekt', beat: 1 },
        { text: '25 Artikel bleiben zur Prüfung', beat: 2, tone: 'warning' },
      ],
    },
    {
      title: 'Fachbereich prüft',
      description: 'Der Agent findet – der Mensch entscheidet, was richtig ist.',
      phase: 'freigabe',
      icon: 'human',
      duration: 900,
      human: {
        question: '25 Artikel benötigen Prüfung. Bericht an Einkauf und Vertrieb übergeben?',
        approve: 'Bericht freigeben',
        edit: 'Bearbeiten',
        editHint: 'Hier könnten weitere Artikel als „bewusst ohne Preis“ markiert werden.',
      },
      activities: [],
    },
    {
      title: 'Bericht erstellen',
      description: 'Ein übersichtlicher Bericht mit allen betroffenen Artikeln entsteht.',
      phase: 'ergebnis',
      icon: 'file',
      duration: 1800,
      activities: [{ text: 'Ergebnisbericht erstellt', beat: 1, tone: 'success' }],
    },
  ],
  facts: [
    { label: 'Datenbestand', value: '1.842 Artikel', step: 0, beat: 1 },
    { label: 'Geprüft', value: '1.842', step: 2, beat: 2 },
    { label: 'Fundstellen', value: '28', step: 3, beat: 1 },
    { label: 'Davon korrekt (Leergut)', value: '3', step: 4, beat: 1 },
    { label: 'Zur Prüfung', value: '25 Artikel', step: 4, beat: 2, tone: 'warning' },
  ],
  recap: {
    verstehen: 'Erkannt, welche Felder Preise enthalten und was ein „ungültiger“ Preis ist',
    suchen: 'Alle 1.842 Artikel vollständig durchsucht – nicht nur Stichproben',
    strukturieren: 'Fundstellen nach Art sortiert – klar, wer was tun muss',
    handeln: 'Ergebnisbericht erstellt, exportierbar für Einkauf und Vertrieb',
    pruefen: 'Leergut als gewollte Ausnahme erkannt – der Fachbereich entscheidet über den Rest',
  },
  Workspace,
  Output,
}
