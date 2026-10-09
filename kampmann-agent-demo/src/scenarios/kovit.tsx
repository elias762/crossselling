import { Download, Link2, TriangleAlert } from 'lucide-react'
import type { ScenarioDef, ScenarioProps } from '../engine/types'
import { Badge, FileChip, Panel, Placeholder, StatTile, cx, pct, toast } from '../components/ui'

type Row = { nr: string; name: string; supplier: string; q3: number; q4: number | null; issue?: string }
const ROWS: Row[] = [
  { nr: '30112', name: 'Nordquell Classic 12 × 0,7 l', supplier: 'Nordquell Brunnen', q3: 2.0, q4: 3.5 },
  { nr: '41207', name: 'Apfelsaft naturtrüb 6 × 1,0 l', supplier: 'Hofgut Elbtal', q3: 2.5, q4: 4.0 },
  { nr: '52031', name: 'Pils 50 l KEG', supplier: 'Brauhaus Lindner', q3: 3.0, q4: 4.2 },
  { nr: '60318', name: 'Cola 24 × 0,33 l Glas', supplier: 'Fizz & Co.', q3: 1.8, q4: 2.9 },
  { nr: '61088', name: 'Tonic Water 24 × 0,2 l', supplier: 'Fizz & Co.', q3: 1.8, q4: 12.0, issue: 'Sprung auf 12,0 % – unplausibel' },
  { nr: '70415', name: 'Trollinger 6 × 0,75 l', supplier: 'Weingut Bergblick', q3: 2.2, q4: null },
]

const COLS = [
  { key: 'A', label: 'Art.-Nr.', meaning: 'Artikelnummer', w: 'w-24' },
  { key: 'B', label: 'Bezeichnung', meaning: '', w: '' },
  { key: 'C', label: 'Lieferant', meaning: 'Lieferant', w: 'w-40' },
  { key: 'D', label: 'Satz Q3', meaning: 'alter Satz', w: 'w-28' },
  { key: 'E', label: 'Satz Q4', meaning: 'neuer Satz', w: 'w-28' },
  { key: 'F', label: 'Hinweis', meaning: '', w: 'w-56' },
]
// Teilschritt in Schritt 2, in dem die Spalte „verstanden“ wird
const COL_BEAT: Record<string, number> = { A: 1, C: 2, D: 3, E: 4 }

function Inputs() {
  return (
    <div data-anchor={0} className="flex flex-wrap items-center gap-3 rounded-2xl">
      <span className="text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Input</span>
      <FileChip name="KOVIT_Q4.xlsx" meta="237 Datensätze · Erhöhungssätze je Artikel" />
      <span className="text-slate-300">+</span>
      <FileChip name="Preiserhöhungen_Lieferanten.xlsx" meta="neue Sätze der Lieferanten" />
    </div>
  )
}

function Workspace({ p }: ScenarioProps) {
  if (!p.reached(0, 1))
    return (
      <div className="space-y-4">
        <Inputs />
        <Placeholder className="py-10 text-center">Die Excel-Datei wird hier geöffnet, sobald der Agent startet.</Placeholder>
      </div>
    )

  return (
    <div className="space-y-4">
      <Inputs />
      <Panel
        anchor={1}
        title="KOVIT_Q4.xlsx · Tabellenblatt „Sätze Q4“"
        icon={<span className="grid size-4 place-items-center rounded-sm bg-emerald-600 text-[0.55rem] font-bold text-white">X</span>}
        aside={p.reached(4, 2) ? <Badge tone="warn">4 Zeilen markiert</Badge> : p.reached(3, 6) ? <Badge tone="ok">221 Zellen aktualisiert</Badge> : undefined}
      >
        <div className="thin-scroll overflow-x-auto rounded-lg border border-slate-300">
          <table className="w-full border-collapse font-[system-ui] text-[0.9rem]">
            <thead>
              <tr className="bg-slate-100 text-xs text-slate-500">
                <th className="w-10 border border-slate-300" />
                {COLS.map((c) => {
                  const known = COL_BEAT[c.key] !== undefined && p.reached(1, COL_BEAT[c.key])
                  return (
                    <th key={c.key} className={cx('border border-slate-300 px-2 py-0.5 font-medium transition-colors duration-500', c.w, known && 'bg-brand-100 text-brand-800')}>
                      {c.key}
                      {known && c.meaning && <div className="text-[0.62rem] font-semibold tracking-wide text-brand-700 uppercase">= {c.meaning}</div>}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-slate-50 font-semibold text-slate-700">
                <td className="border border-slate-300 text-center text-xs font-normal text-slate-400">1</td>
                {COLS.map((c) => (
                  <td key={c.key} className="border border-slate-300 px-2 py-1">
                    {c.label}
                  </td>
                ))}
              </tr>
              {ROWS.map((r, i) => {
                const matched = p.reached(2, 1) && r.q4 !== null
                const unchanged = r.q4 === null && p.reached(2, 2)
                const written = r.q4 !== null && p.reached(3, i + 1)
                const flagged = !!r.issue && p.reached(4, 1)
                return (
                  <tr key={r.nr} className={cx('transition-colors duration-500', flagged && 'bg-amber-50')}>
                    <td className="border border-slate-300 text-center text-xs text-slate-400">{i + 2}</td>
                    <td className={cx('tabular border border-slate-300 px-2 py-1.5 transition-colors duration-500', matched && 'bg-brand-50 font-semibold text-brand-800')}>
                      <span className="inline-flex items-center gap-1">
                        {r.nr}
                        {matched && <Link2 className="size-3 text-brand-500" />}
                      </span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-700">{r.name}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{r.supplier}</td>
                    <td className="tabular border border-slate-300 px-2 py-1.5 text-right text-slate-600">{pct(r.q3)}</td>
                    <td
                      key={written ? 'w' : 'e'}
                      className={cx(
                        'tabular border px-2 py-1.5 text-right',
                        written && !flagged && 'animate-flash border-slate-300 font-semibold text-slate-900',
                        flagged && 'border-amber-400 bg-amber-100 font-semibold text-amber-800 ring-1 ring-amber-400 ring-inset',
                        !written && 'border-slate-300 text-slate-300',
                      )}
                    >
                      {written ? pct(r.q4!) : unchanged ? <span className="text-slate-500">{pct(r.q3)}</span> : ''}
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-xs">
                      {flagged ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <TriangleAlert className="size-3.5" /> {r.issue}
                        </span>
                      ) : unchanged ? (
                        <span className="text-slate-500">keine neue Angabe – bleibt</span>
                      ) : written ? (
                        <span className="text-emerald-700">übernommen</span>
                      ) : matched ? (
                        <span className="text-brand-600">zugeordnet</span>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
              <tr>
                <td className="border border-slate-300 text-center text-xs text-slate-400">…</td>
                <td colSpan={6} className="border border-slate-300 px-2 py-1.5 text-xs text-slate-400 italic">
                  … 231 weitere Zeilen
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}

function Output({ p }: ScenarioProps) {
  const run = p.reached(6)
  const skip = p.finished
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile value={237} label="Datensätze geprüft" run={run} skip={skip} />
        <StatTile value={221} label="automatisch zugeordnet" tone="ok" run={run} skip={skip} />
        <StatTile value={12} label="unverändert" run={run} skip={skip} />
        <StatTile value={4} label="zur manuellen Prüfung" tone="warn" run={run} skip={skip} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          onClick={() => toast('Demo: Hier würde „KOVIT_Q4_aktualisiert.xlsx“ heruntergeladen.')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <Download className="size-4.5" /> Aktualisierte KOVIT-Datei herunterladen
        </button>
        <span className="text-sm text-slate-500">Auffällige Zeilen sind in der Datei gelb markiert.</span>
      </div>
    </div>
  )
}

export const kovitScenario: ScenarioDef = {
  id: 'kovit',
  name: 'KOVIT Agent',
  subtitle: 'Preiserhöhungssätze automatisch in Excel pflegen',
  origin: 'KOVIT-Datei aktualisieren',
  context:
    'In der KOVIT-Datei (Excel) werden je Artikel die Preiserhöhungssätze der Lieferanten gepflegt. Heute werden neue Sätze von Hand aus den Lieferantendaten übertragen.',
  icon: 'excel',
  source: 'Excel',
  clockStart: 13 * 3600 + 15 * 60 + 2,
  outputTitle: 'Aktualisierte KOVIT-Datei',
  next: 'quality',
  steps: [
    {
      title: 'Excel-Datei einlesen',
      description: 'Die KOVIT-Datei und die neuen Lieferantendaten werden geöffnet.',
      insight: 'Der Agent arbeitet mit den Excel-Dateien, die es heute schon gibt – kein neues System nötig.',
      phase: 'input',
      icon: 'excel',
      beats: 2,
      duration: 2800,
      activities: [
        { text: 'KOVIT_Q4.xlsx geöffnet', tone: 'data' },
        { text: '237 Datensätze eingelesen', beat: 2, tone: 'success' },
      ],
    },
    {
      title: 'Spalten verstehen',
      description: 'Die KI erkennt, welche Spalte welche Bedeutung hat.',
      insight: 'Die KI versteht den Aufbau der Tabelle selbst – auch ohne feste Vorlage oder Programmierung.',
      phase: 'verstehen',
      icon: 'columns',
      beats: 4,
      duration: 4400,
      activities: [
        { text: 'Spaltenaufbau wird analysiert' },
        { text: 'Bedeutung aller Spalten erkannt', beat: 4, tone: 'success' },
      ],
    },
    {
      title: 'Neue Sätze zuordnen',
      description: 'Jeder Artikel wird über die Artikelnummer mit den Lieferantendaten verknüpft.',
      insight: 'Zwei Dateien werden über die Artikelnummer zusammengeführt – genau das, was sonst per SVERWEIS passiert.',
      phase: 'holen',
      icon: 'link',
      beats: 2,
      duration: 3200,
      activities: [
        { text: '221 Artikel zugeordnet', beat: 1, tone: 'success' },
        { text: '12 Artikel ohne neue Angabe', beat: 2 },
      ],
    },
    {
      title: 'Zellen aktualisieren',
      description: 'Spalte E wird Zeile für Zeile befüllt.',
      insight: 'Die eigentliche Fleißarbeit – Zelle für Zelle übertragen – übernimmt der Agent.',
      phase: 'verarbeiten',
      icon: 'pen',
      beats: 6,
      duration: 4200,
      activities: [{ text: '221 Zellen aktualisiert', beat: 6, tone: 'success' }],
    },
    {
      title: 'Auffälligkeiten prüfen',
      description: 'Ungewöhnliche Sprünge werden erkannt und markiert.',
      insight: 'Ein Sprung von 1,8 % auf 12 % fällt auf – der Agent markiert ihn, statt ihn einfach zu übernehmen.',
      phase: 'pruefen',
      icon: 'clipboard',
      beats: 2,
      duration: 3200,
      activities: [
        { text: '61088: Sprung von 1,8 % auf 12,0 %', beat: 1, tone: 'warning' },
        { text: '4 Zeilen zur Prüfung markiert', beat: 2, tone: 'warning' },
      ],
    },
    {
      title: 'Mitarbeiter prüft',
      description: 'Ein Mitarbeiter entscheidet über die markierten Zeilen.',
      phase: 'freigabe',
      icon: 'human',
      duration: 900,
      human: {
        question: '4 Zeilen sind auffällig und gelb markiert. Datei so bereitstellen?',
        approve: 'Datei freigeben',
        edit: 'Auffälligkeiten ansehen',
        editHint: 'Beispiel 61088 Tonic Water: Lieferant meldet 12,0 % statt bisher 1,8 % – Rückfrage beim Lieferanten empfohlen.',
      },
      activities: [],
    },
    {
      title: 'Datei bereitstellen',
      description: 'Die aktualisierte KOVIT-Datei steht zum Download bereit.',
      phase: 'ergebnis',
      icon: 'download',
      duration: 1800,
      activities: [{ text: 'KOVIT_Q4_aktualisiert.xlsx bereitgestellt', beat: 1, tone: 'success' }],
    },
  ],
  facts: [
    { label: 'Datei', value: 'KOVIT_Q4.xlsx', step: 0 },
    { label: 'Datensätze', value: '237', step: 0, beat: 2 },
    { label: 'Zugeordnet', value: '221', step: 2, beat: 1 },
    { label: 'Unverändert', value: '12', step: 2, beat: 2 },
    { label: 'Zur Prüfung', value: '4 Zeilen', step: 4, beat: 2, tone: 'warning' },
  ],
  recap: {
    verstehen: 'Aufbau der Excel-Datei erkannt: welche Spalte ist Artikel, Lieferant, alter und neuer Satz',
    suchen: 'Zu jedem Artikel den passenden neuen Satz aus den Lieferantendaten gefunden',
    strukturieren: 'Zwei unterschiedliche Dateien über die Artikelnummer zusammengeführt',
    handeln: '221 Zellen automatisch befüllt und die Datei bereitgestellt',
    pruefen: 'Unplausible Sprünge erkannt – 4 Zeilen gelb markiert für den Menschen',
  },
  Workspace,
  Output,
}
