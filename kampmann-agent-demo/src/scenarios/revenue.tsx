import { ArrowLeftRight, Check, Download, Link2, ServerCog, TriangleAlert } from 'lucide-react'
import type { ScenarioDef, ScenarioProps } from '../engine/types'
import { Badge, FileChip, Panel, Placeholder, StatTile, SystemChip, chipState, cx, eur, toast, useTween } from '../components/ui'

type Row = { nr: string; customer: string; gastivo: number | null; intern: number }
const ROWS: Row[] = [
  { nr: '100482', customer: 'Restaurant Hafenblick', gastivo: null, intern: 1284.5 },
  { nr: '100519', customer: 'Hotel Lindenhof', gastivo: null, intern: 864.2 },
  { nr: '100533', customer: 'Café Kranz', gastivo: 1120.0, intern: 1120.0 },
  { nr: '100571', customer: 'Brauhaus am Markt', gastivo: 945.0, intern: 899.0 },
]
// Reihenfolge, in der leere Felder in Schritt 4 befüllt werden
const FILL_ORDER = ROWS.filter((r) => r.gastivo === null).map((r) => r.nr)

type Status = 'match' | 'same' | 'diff'
const statusOf = (r: Row): Status => (r.gastivo === null ? 'match' : r.gastivo === r.intern ? 'same' : 'diff')

function StatusBadge({ s }: { s: Status }) {
  if (s === 'match')
    return (
      <Badge tone="ok" icon={<Check className="size-3" />}>
        Match · ergänzt
      </Badge>
    )
  if (s === 'same')
    return (
      <Badge tone="brand" icon={<Check className="size-3" />}>
        Übereinstimmung
      </Badge>
    )
  return (
    <Badge tone="warn" icon={<TriangleAlert className="size-3" />}>
      Abweichung
    </Badge>
  )
}

function Workspace({ p }: ScenarioProps) {
  const matching = useTween(p.reached(2), p.stepMs(2) * 0.85, p.reached(3))
  const matched = Math.round(428 * matching)

  return (
    <div className="space-y-4">
      {/* Zwei Datenquellen und die Verbindung dazwischen */}
      <div data-anchor={0} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col items-start gap-2">
          <span className="text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Input</span>
          <FileChip name="Gastivo_Q3.xlsx" meta="428 Bestellungen · Umsätze teilweise leer" />
        </div>
        <div className="flex w-56 flex-col items-center gap-1.5 text-center">
          <div className={cx('grid size-10 place-items-center rounded-full transition-colors', p.reached(2) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400')}>
            {p.reached(2) ? <Link2 className="size-5" /> : <ArrowLeftRight className="size-5" />}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${matching * 100}%` }} />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {p.reached(2) ? (
              <>
                <span className="tabular">{matched}</span> / 428 abgeglichen
              </>
            ) : (
              'Abgleich über Bestellnummer'
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Unternehmensdaten</span>
          <SystemChip label="Internes Umsatzsystem" state={chipState(p, 2, 1)} icon={<ServerCog className="size-3.5" />} />
        </div>
      </div>

      {p.reached(0, 1) ? (
        <Panel anchor={1} title="Gastivo_Q3.xlsx · Abgleich" aside={p.reached(4, 2) ? <Badge tone="warn">7 Abweichungen markiert</Badge> : undefined}>
          <table className="w-full text-[1rem]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-400 uppercase">
                <th className={cx('py-2 pr-3 font-semibold transition-colors', p.active(1) && 'text-brand-600')}>Bestellnummer</th>
                <th className="py-2 pr-3 font-semibold">Kunde</th>
                <th className={cx('py-2 pr-3 text-right font-semibold transition-colors', p.active(3) && 'text-brand-600')}>Gastivo</th>
                <th className={cx('py-2 pr-3 text-right font-semibold transition-colors', p.active(2) && 'text-brand-600')}>Intern</th>
                <th className={cx('py-2 font-semibold transition-colors', p.active(4) && 'text-brand-600')}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => {
                const s = statusOf(r)
                const nrKnown = p.reached(1, 1)
                const internShown = p.reached(2, i + 1)
                const fillIndex = FILL_ORDER.indexOf(r.nr)
                const filled = fillIndex >= 0 && p.reached(3, fillIndex + 1)
                const statusShown = s === 'match' ? filled : p.reached(4, 1)
                const diff = s === 'diff' && statusShown
                return (
                  <tr key={r.nr} className={cx('border-b border-slate-100 transition-colors duration-500', diff && 'bg-amber-50')}>
                    <td className="py-2.5 pr-3">
                      <span className={cx('tabular rounded px-1 font-semibold transition-colors duration-500', nrKnown ? 'bg-brand-50 text-brand-800' : 'text-slate-700')}>{r.nr}</span>
                      {internShown && <Link2 className="ml-1.5 inline size-3.5 text-brand-500" />}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600">{r.customer}</td>
                    <td key={filled ? 'f' : 'e'} className={cx('tabular py-2.5 pr-3 text-right', filled && 'animate-flash font-semibold text-emerald-700', diff && 'font-semibold text-amber-700')}>
                      {r.gastivo !== null ? eur(r.gastivo) : filled ? eur(r.intern) : <span className="text-slate-300 italic">leer</span>}
                    </td>
                    <td className={cx('tabular py-2.5 pr-3 text-right', diff ? 'font-semibold text-amber-700' : 'text-slate-700')}>
                      {internShown ? eur(r.intern) : <span className="text-slate-300">–</span>}
                    </td>
                    <td className="py-2.5">
                      {statusShown ? (
                        <span className="inline-flex items-center gap-2">
                          <StatusBadge s={s} />
                          {diff && <span className="text-xs font-medium text-amber-700">Δ {eur(r.gastivo! - r.intern)}</span>}
                        </span>
                      ) : (
                        <span className="text-slate-300">–</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              <tr>
                <td colSpan={5} className="py-2 text-sm text-slate-400 italic">
                  … 424 weitere Bestellungen
                </td>
              </tr>
            </tbody>
          </table>
        </Panel>
      ) : (
        <Placeholder className="py-10 text-center">Die Gastivo-Liste wird hier geöffnet, sobald der Agent startet.</Placeholder>
      )}
    </div>
  )
}

function Output({ p }: ScenarioProps) {
  const run = p.reached(6)
  const skip = p.finished
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile value={428} label="Bestellungen geprüft" run={run} skip={skip} />
        <StatTile value={407} label="automatisch zugeordnet" tone="ok" run={run} skip={skip} />
        <StatTile value={14} label="bereits korrekt" tone="brand" run={run} skip={skip} />
        <StatTile value={7} label="Abweichungen zur Prüfung" tone="warn" run={run} skip={skip} />
      </div>
      <div className="mt-5">
        <button
          onClick={() => toast('Demo: Hier würde „Gastivo_Q3_abgeglichen.xlsx“ heruntergeladen.')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <Download className="size-4.5" /> Aktualisierte Gastivo-Liste herunterladen
        </button>
      </div>
    </div>
  )
}

export const revenueScenario: ScenarioDef = {
  id: 'revenue',
  name: 'Revenue Matching Agent',
  subtitle: 'Gastivo-Umsätze automatisch mit internen Umsätzen abgleichen',
  origin: 'Gastivo-Umsatzabgleich',
  context:
    'Gastivo ist eine Bestellplattform für Gastronomen. Die Umsätze aus der Gastivo-Liste müssen mit den eigenen Umsatzdaten abgeglichen und ergänzt werden – heute Bestellnummer für Bestellnummer von Hand.',
  icon: 'compare',
  source: 'Excel + internes System',
  clockStart: 14 * 3600 + 2 * 60 + 10,
  outputTitle: 'Abgeglichene Gastivo-Liste',
  next: 'document',
  steps: [
    {
      title: 'Gastivo-Datei einlesen',
      description: 'Die Gastivo-Liste mit Bestellnummern und Quartal wird geöffnet.',
      insight: 'Der Input ist die Excel-Liste, die heute schon von Gastivo kommt – mit Lücken bei den Umsätzen.',
      phase: 'input',
      icon: 'excel',
      beats: 2,
      duration: 2800,
      activities: [
        { text: 'Gastivo_Q3.xlsx geöffnet', tone: 'data' },
        { text: '428 Bestellungen eingelesen', beat: 2, tone: 'success' },
      ],
    },
    {
      title: 'Bestellnummern erkennen',
      description: 'Die Bestellnummern sind der Schlüssel für den Abgleich.',
      insight: 'Die Bestellnummer ist die Brücke zwischen den beiden Welten – Gastivo und internes System.',
      phase: 'verstehen',
      icon: 'hash',
      duration: 2400,
      activities: [{ text: '428 Bestellnummern erkannt', beat: 1, tone: 'success' }],
    },
    {
      title: 'Interne Umsätze abrufen',
      description: 'Zu jeder Bestellnummer wird der Umsatz im internen System gesucht.',
      insight: 'Der Agent sucht zu jeder Bestellung den internen Umsatz – 428-mal, ohne zu ermüden.',
      phase: 'holen',
      icon: 'database',
      beats: 4,
      duration: 4800,
      activities: [
        { text: 'Bestellnummer 100482 gefunden', beat: 1, tone: 'success' },
        { text: '428 von 428 zugeordnet', beat: 4, tone: 'success' },
      ],
    },
    {
      title: 'Werte ergänzen',
      description: 'Leere Umsatzfelder in der Gastivo-Liste werden befüllt.',
      insight: 'Die Lücken in der Liste werden automatisch gefüllt – das ist die eigentliche Zeitersparnis.',
      phase: 'verarbeiten',
      icon: 'pen',
      beats: 2,
      duration: 3000,
      activities: [
        { text: 'Umsatzwert übernommen', beat: 1 },
        { text: '407 Umsatzwerte ergänzt', beat: 2, tone: 'success' },
      ],
    },
    {
      title: 'Differenzen erkennen',
      description: 'Wo Gastivo und das interne System nicht übereinstimmen, schlägt der Agent an.',
      insight: 'Abweichungen werden nicht „passend gemacht“, sondern gezielt an einen Menschen übergeben.',
      phase: 'pruefen',
      icon: 'compare',
      beats: 2,
      duration: 3200,
      activities: [
        { text: 'Bestellnummer 100571 weist eine Differenz auf', beat: 1, tone: 'warning' },
        { text: 'Datensatz zur manuellen Prüfung markiert', beat: 2, tone: 'warning' },
      ],
    },
    {
      title: 'Ergebnis prüfen',
      description: 'Ein Mitarbeiter sieht sich die Abweichungen an und gibt frei.',
      phase: 'freigabe',
      icon: 'human',
      duration: 900,
      human: {
        question: '407 Werte ergänzt, 14 bereits korrekt, 7 Abweichungen markiert. Abgleich freigeben?',
        approve: 'Abgleich freigeben',
        edit: 'Abweichungen ansehen',
        editHint: 'Beispiel 100571: Gastivo 945,00 € ↔ intern 899,00 € – mögliche Gutschrift oder Retoure prüfen.',
      },
      activities: [],
    },
    {
      title: 'Datei bereitstellen',
      description: 'Die ergänzte Gastivo-Liste steht zum Download bereit.',
      phase: 'ergebnis',
      icon: 'download',
      duration: 1800,
      activities: [{ text: 'Gastivo_Q3_abgeglichen.xlsx bereitgestellt', beat: 1, tone: 'success' }],
    },
  ],
  facts: [
    { label: 'Datei', value: 'Gastivo_Q3.xlsx', step: 0 },
    { label: 'Bestellungen', value: '428', step: 0, beat: 2 },
    { label: 'Abgleich über', value: 'Bestellnummer', step: 1, beat: 1 },
    { label: 'Automatisch ergänzt', value: '407', step: 3, beat: 2 },
    { label: 'Abweichungen', value: '7 zur Prüfung', step: 4, beat: 2, tone: 'warning' },
  ],
  recap: {
    verstehen: 'Aufbau der Gastivo-Liste erkannt und Bestellnummern als Schlüssel genutzt',
    suchen: 'Zu 428 Bestellungen die internen Umsätze gefunden',
    strukturieren: 'Zwei Datenquellen – externe Excel und internes System – zusammengeführt',
    handeln: '407 leere Umsatzfelder automatisch befüllt und Datei bereitgestellt',
    pruefen: '7 Abweichungen erkannt und gezielt an einen Menschen übergeben',
  },
  Workspace,
  Output,
}
