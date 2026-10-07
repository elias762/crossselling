import { memo } from 'react'
import { Database, Download, FileWarning, TriangleAlert } from 'lucide-react'
import type { ScenarioDef, ScenarioProps } from '../engine/types'
import { Badge, CountUp, Label, Panel, Placeholder, Reveal, StatTile, SystemChip, chipState, cx, toast, useTween } from '../components/ui'

const TOTAL = 1842
const COLS = 74

// 25 deterministisch verteilte Auffälligkeiten
const ANOMALIES = (() => {
  const set = new Set<number>()
  let x = 7
  while (set.size < 25) {
    x = (x * 1103515245 + 12345) % 2147483648
    set.add(x % TOTAL)
  }
  return set
})()

const CATEGORIES = [
  { label: 'Verkaufspreis fehlt', n: 11 },
  { label: 'Preis = 0,00 €', n: 8 },
  { label: 'Einkaufspreis fehlt', n: 6 },
]

const EXAMPLES = [
  { nr: '47291', name: 'Weißweinschorle 24 × 0,33 l', issue: 'Verkaufspreis fehlt', hint: 'Neuanlage ohne Kalkulation' },
  { nr: '58120', name: 'Kaffee Crema 1 kg', issue: 'Preis = 0,00 €', hint: 'Platzhalterpreis' },
  { nr: '61022', name: 'Holunderblütensirup 6 × 0,7 l', issue: 'Einkaufspreis fehlt', hint: 'Lieferantenkondition fehlt' },
  { nr: '63310', name: 'Eistee Pfirsich 24 × 0,33 l', issue: 'Verkaufspreis fehlt', hint: 'Neuanlage ohne Kalkulation' },
  { nr: '72045', name: 'Glühwein 6 × 1,0 l', issue: 'Preis = 0,00 €', hint: 'Saisonartikel' },
]

const Matrix = memo(function Matrix({ scanned, reveal }: { scanned: number; reveal: boolean }) {
  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }} aria-hidden>
      {Array.from({ length: TOTAL }, (_, i) => {
        const done = i < scanned
        const bad = reveal && ANOMALIES.has(i)
        return (
          <span
            key={i}
            className={cx(
              'aspect-square rounded-[2px] transition-colors duration-300',
              bad ? 'scale-150 bg-amber-500 ring-1 ring-amber-200' : done ? 'bg-brand-300' : 'bg-slate-200',
            )}
          />
        )
      })}
    </div>
  )
})

function Workspace({ p }: ScenarioProps) {
  const scan = useTween(p.reached(1), p.stepMs(1) * 0.85, p.reached(2))
  const scanned = Math.round(TOTAL * scan)
  const reveal = p.reached(3, 1)

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 space-y-4 xl:col-span-4">
        <Panel title="Input · Artikelstamm" icon={<Database className="size-4" />}>
          <SystemChip label="Artikelstammdaten (Beispieldaten)" state={chipState(p, 0, 1)} icon={<Database className="size-3.5" />} />
          <div className="mt-5">
            <div className="text-[0.95rem] text-slate-500">{p.reached(1) && !p.reached(2) ? 'Artikel werden geprüft …' : 'Artikel geprüft'}</div>
            <div className="text-[3.2rem] leading-none font-semibold tracking-tight text-slate-900">
              <span className="tabular">{scanned.toLocaleString('de-DE')}</span>
              <span className="text-2xl font-medium text-slate-400"> / 1.842</span>
            </div>
          </div>
          <div className="mt-5">
            <Label>Geprüfte Preisfelder</Label>
            <div className="flex flex-wrap gap-1.5">
              {['Einkaufspreis', 'Verkaufspreis', 'Preiseinheit'].map((f, i) => (
                <Badge key={f} tone={p.reached(2, i + 1) ? 'brand' : 'neutral'}>
                  {f}
                </Badge>
              ))}
            </div>
          </div>
        </Panel>

        {p.reached(4) ? (
          <Reveal show>
            <Panel anchor={4} title="Ausnahmen nach Art" icon={<TriangleAlert className="size-4" />}>
              <div className="space-y-3">
                {CATEGORIES.map((c, i) => (
                  <Reveal key={c.label} show={p.reached(4, i + 1)}>
                    <div className="flex items-center justify-between text-[0.95rem]">
                      <span className="text-slate-700">{c.label}</span>
                      <span className="font-semibold text-amber-700 tabular">{c.n}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${(c.n / 11) * 100}%` }} />
                    </div>
                  </Reveal>
                ))}
              </div>
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Ausnahmen · werden nach Art sortiert</Placeholder>
        )}
      </div>

      <div className="col-span-12 xl:col-span-8">
        <Panel
          anchor={1}
          title="Artikelbestand · jedes Kästchen ist ein Artikel"
          aside={reveal ? <Badge tone="warn" icon={<TriangleAlert className="size-3" />}>25 Auffälligkeiten</Badge> : p.reached(2) ? <Badge tone="ok">vollständig geprüft</Badge> : undefined}
        >
          <Matrix scanned={scanned} reveal={reveal} />
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px] bg-slate-200" /> noch nicht geprüft
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px] bg-brand-300" /> geprüft, Preis vollständig
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
      <table className="mt-5 w-full text-[0.95rem]">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-400 uppercase">
            <th className="py-2 font-semibold">Artikel</th>
            <th className="py-2 font-semibold">Auffälligkeit</th>
            <th className="py-2 font-semibold">Möglicher Grund</th>
          </tr>
        </thead>
        <tbody>
          {EXAMPLES.map((e) => (
            <tr key={e.nr} className="border-b border-slate-100">
              <td className="py-2">
                <span className="font-semibold text-slate-800">Artikel {e.nr}</span> <span className="text-slate-500">– {e.name}</span>
              </td>
              <td className="py-2">
                <Badge tone="warn">{e.issue}</Badge>
              </td>
              <td className="py-2 text-slate-500">{e.hint}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} className="py-2 text-sm text-slate-400 italic">
              … und <CountUp value={20} run={run} ms={600} skip={skip} /> weitere
            </td>
          </tr>
        </tbody>
      </table>
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
      title: 'Artikeldaten laden',
      description: 'Der komplette Artikelbestand wird geladen.',
      phase: 'input',
      icon: 'database',
      beats: 1,
      duration: 1500,
      activities: [
        { text: 'Artikelstamm wird geladen', tone: 'data' },
        { text: '1.842 Artikel geladen', beat: 1, tone: 'success' },
      ],
    },
    {
      title: 'Alle Datensätze prüfen',
      description: 'Jeder einzelne Artikel wird durchgesehen – in Sekunden statt Stunden.',
      phase: 'verarbeiten',
      icon: 'scan',
      beats: 3,
      duration: 4200,
      activities: [
        { text: '1.842 Artikel werden geprüft …' },
        { text: 'Alle Datensätze geprüft', beat: 3, tone: 'success' },
      ],
    },
    {
      title: 'Preisfelder analysieren',
      description: 'Einkaufspreis, Verkaufspreis und Preiseinheit werden je Artikel bewertet.',
      phase: 'verstehen',
      icon: 'table',
      beats: 3,
      duration: 2100,
      activities: [{ text: 'Preisfelder werden analysiert' }],
    },
    {
      title: 'Fehlende Preise erkennen',
      description: 'Leere Felder und ungültige Werte wie 0,00 € werden gefunden.',
      phase: 'pruefen',
      icon: 'warning',
      duration: 1600,
      activities: [{ text: '25 Auffälligkeiten gefunden', beat: 1, tone: 'warning' }],
    },
    {
      title: 'Ausnahmen klassifizieren',
      description: 'Die Auffälligkeiten werden nach Art sortiert – damit klar ist, wer was tun muss.',
      phase: 'verarbeiten',
      icon: 'tags',
      beats: 3,
      duration: 2400,
      activities: [
        { text: '11 × Verkaufspreis fehlt', beat: 1, tone: 'data' },
        { text: '8 × Preis = 0,00 €', beat: 2, tone: 'data' },
        { text: '6 × Einkaufspreis fehlt', beat: 3, tone: 'data' },
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
        editHint: 'Hier könnten einzelne Artikel als „bewusst ohne Preis“ (z. B. Leergut, Pfand) markiert werden.',
      },
      activities: [{ text: 'Ausnahmeliste zur Prüfung vorgelegt' }],
    },
    {
      title: 'Ergebnisbericht erstellen',
      description: 'Ein übersichtlicher Bericht mit allen betroffenen Artikeln entsteht.',
      phase: 'ergebnis',
      icon: 'file',
      duration: 1500,
      activities: [{ text: 'Ergebnisbericht erstellt', beat: 1, tone: 'success' }],
    },
  ],
  facts: [
    { label: 'Datenbestand', value: '1.842 Artikel', step: 0, beat: 1 },
    { label: 'Geprüft', value: '1.842', step: 1, beat: 3 },
    { label: 'Vollständig', value: '1.817', step: 3, beat: 1 },
    { label: 'Auffälligkeiten', value: '25', step: 3, beat: 1, tone: 'warning' },
    { label: 'Häufigster Fall', value: 'Verkaufspreis fehlt (11)', step: 4, beat: 3 },
  ],
  recap: {
    verstehen: 'Erkannt, welche Felder Preise enthalten und was ein „ungültiger“ Preis ist',
    suchen: 'Alle 1.842 Artikel vollständig durchsucht – nicht nur Stichproben',
    strukturieren: '25 Auffälligkeiten nach Art sortiert, mit möglichem Grund',
    handeln: 'Ergebnisbericht erstellt, exportierbar für Einkauf und Vertrieb',
    pruefen: 'Der Fachbereich entscheidet, welche Artikel bewusst ohne Preis sind',
  },
  Workspace,
  Output,
}
