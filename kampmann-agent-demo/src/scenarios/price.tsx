import { Check, FileText, Loader2, Mail, ServerCog, TriangleAlert } from 'lucide-react'
import type { ScenarioDef, ScenarioProps } from '../engine/types'
import { Badge, FileChip, MarkedText, Panel, Placeholder, StatTile, cx, eur, type Seg } from '../components/ui'

const RATE = 0.035

type Row = { nr: string; name: string; old: number | null; flag?: string }
const ROWS: Row[] = [
  { nr: '30112', name: 'Nordquell Classic 12 × 0,7 l Glas', old: 6.8 },
  { nr: '30113', name: 'Nordquell Medium 12 × 0,7 l Glas', old: 6.8 },
  { nr: '30120', name: 'Nordquell Naturell 12 × 0,7 l Glas', old: 6.6 },
  { nr: '30145', name: 'Nordquell Apfelschorle 24 × 0,33 l', old: 9.4 },
  { nr: '30151', name: 'Nordquell Classic 6 × 1,5 l PET', old: 4.04, flag: 'Bereits am 12.09. erhöht – doppelte Erhöhung?' },
  { nr: '30160', name: 'Nordquell Classic 20 × 0,5 l PET', old: 7.2 },
  { nr: '30188', name: 'Nordquell Bio-Limo 24 × 0,33 l', old: null, flag: 'Artikel nicht eindeutig – 2 mögliche Treffer' },
]
const OK = ROWS.filter((r) => !r.flag).length
const round2 = (v: number) => Math.round(v * 100) / 100

const LETTER: Seg[] = [
  { text: 'Sehr geehrte Damen und Herren,\naufgrund gestiegener Energie- und Logistikkosten erhöhen wir ' },
  { text: 'zum 01.11.', at: [0, 2], tag: 'Gültig ab' },
  { text: ' die Einkaufspreise für ' },
  { text: 'ausgewählte Artikel', at: [1, 0], tag: 'Betroffen' },
  { text: ' ' },
  { text: 'um 3,5\u00a0%', at: [0, 2], tag: 'Erhöhung' },
  { text: '. Die betroffenen Artikel finden Sie in der beigefügten Liste.\nMit freundlichen Grüßen\nNordquell Brunnen GmbH' },
]

function Workspace({ p }: ScenarioProps) {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 xl:col-span-4">
        <Panel title="Eingang · Lieferant" icon={<Mail className="size-4" />}>
          <div className="mb-3 text-sm">
            <div className="font-semibold text-slate-800">Nordquell Brunnen GmbH</div>
            <div className="text-slate-500">Betreff: Preisanpassung zum 01.11.</div>
          </div>
          <MarkedText segs={LETTER} p={p} className="text-[1rem] leading-[2.2] whitespace-pre-line text-slate-700" />
          <div className="mt-3">
            <FileChip name="Artikelliste_Preisanpassung.pdf" meta="Anhang · 7 Artikel" kind="pdf" />
          </div>
        </Panel>
      </div>

      <div className="col-span-12 xl:col-span-8">
        {p.reached(1) ? (
          <Panel
            anchor={1}
            title="Betroffene Artikel"
            icon={<FileText className="size-4" />}
            aside={
              p.reached(5, 1) ? (
                <span className="flex gap-1.5">
                  <Badge tone="ok">{OK} Änderungen bereit</Badge>
                  <Badge tone="warn">{ROWS.length - OK} zur Prüfung</Badge>
                </span>
              ) : undefined
            }
          >
            <table className="w-full text-[0.92rem]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-400 uppercase">
                  <th className="py-2 pr-3 font-semibold">Artikel</th>
                  <th className="py-2 pr-3 text-right font-semibold">Alter Wert</th>
                  <th className="py-2 pr-3 text-right font-semibold">Änderung</th>
                  <th className="py-2 pr-3 text-right font-semibold">Neuer Wert</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => {
                  if (!p.reached(1, i + 1)) return null
                  const loaded = p.reached(2, 1)
                  const calc = p.reached(3, 1) && r.old !== null
                  const checked = p.reached(4, r.flag ? 2 : 1)
                  const warn = checked && !!r.flag
                  const updated = !r.flag && p.reached(7, Math.min(i + 1, 5))
                  return (
                    <tr key={r.nr} className={cx('border-b border-slate-100 align-top transition-colors duration-500', warn && 'bg-amber-50/80', updated && 'bg-emerald-50/50')}>
                      <td className="py-2 pr-3">
                        <div className="font-medium text-slate-800">{r.name}</div>
                        <div className="text-xs text-slate-400">Art.-Nr. {r.nr}</div>
                        {warn && (
                          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700">
                            <TriangleAlert className="size-3.5" /> {r.flag}
                          </div>
                        )}
                      </td>
                      <td className="tabular py-2 pr-3 text-right text-slate-600">{loaded ? (r.old === null ? <span className="text-amber-600">?</span> : eur(r.old)) : <span className="text-slate-300">–</span>}</td>
                      <td className="tabular py-2 pr-3 text-right text-slate-600">{calc ? '+3,5 %' : <span className="text-slate-300">–</span>}</td>
                      <td className={cx('tabular py-2 pr-3 text-right font-semibold', warn ? 'text-slate-400 line-through' : 'text-slate-900')}>
                        {calc ? eur(round2(r.old! * (1 + RATE))) : <span className="font-normal text-slate-300">–</span>}
                      </td>
                      <td className="py-2">
                        {updated ? (
                          <Badge tone="ok" icon={<Check className="size-3" />}>
                            Aktualisiert
                          </Badge>
                        ) : warn ? (
                          <Badge tone="warn" icon={<TriangleAlert className="size-3" />}>
                            Nicht geändert
                          </Badge>
                        ) : checked ? (
                          <Badge tone="brand">Bereit</Badge>
                        ) : p.active(4) ? (
                          <Loader2 className="size-4 animate-spin text-slate-400" />
                        ) : (
                          <span className="text-slate-300">–</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Panel>
        ) : (
          <Placeholder className="py-10 text-center">Betroffene Artikel · werden aus dem Lieferantenschreiben ausgelesen</Placeholder>
        )}
      </div>
    </div>
  )
}

function Output({ p }: ScenarioProps) {
  const run = p.reached(7)
  const skip = p.finished
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
          <ServerCog className="size-5" />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Warenwirtschaft · Simulation</div>
          <div className="text-xl font-semibold text-slate-900">Preisanpassung Nordquell zum 01.11.</div>
        </div>
        <div className="ml-auto">{p.finished ? <Badge tone="ok">Abgeschlossen</Badge> : <Badge tone="brand">wird übertragen …</Badge>}</div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatTile value={ROWS.length} label="Artikel erkannt" run={run} skip={skip} />
        <StatTile value={OK} label="Preise aktualisiert" tone="ok" run={run} skip={skip} />
        <StatTile value={ROWS.length - OK} label="zur Klärung an den Einkauf" tone="warn" run={run} skip={skip} />
      </div>
      <div className="mt-4 rounded-xl bg-amber-50/70 px-4 py-3 text-[0.95rem] text-amber-900 ring-1 ring-amber-200">
        <span className="font-semibold">Bewusst nicht automatisch geändert:</span> Unklare oder auffällige Datensätze werden markiert und an einen Menschen übergeben – statt sie „irgendwie“ zu verarbeiten.
      </div>
    </div>
  )
}

export const priceScenario: ScenarioDef = {
  id: 'price',
  name: 'Price Update Agent',
  subtitle: 'Preiserhöhungen automatisch verarbeiten',
  origin: 'Preiserhöhungen ins System',
  icon: 'trend',
  source: 'Lieferantenschreiben',
  clockStart: 9 * 3600 + 5 * 60 + 40,
  outputTitle: 'Aktualisierte Einkaufspreise',
  next: 'kovit',
  steps: [
    {
      title: 'Preisinformation erfassen',
      description: 'Das Lieferantenschreiben wird gelesen und die Preiserhöhung erkannt.',
      phase: 'input',
      icon: 'file',
      beats: 2,
      duration: 2400,
      activities: [
        { text: 'Lieferantenschreiben eingegangen · Nordquell Brunnen', tone: 'data' },
        { text: 'Dokument wird gelesen', beat: 1 },
        { text: 'Preiserhöhung erkannt: +3,5 % ab 01.11.', beat: 2, tone: 'data' },
      ],
    },
    {
      title: 'Betroffene Artikel erkennen',
      description: 'Aus der Anlage werden alle betroffenen Artikel ausgelesen.',
      phase: 'verstehen',
      icon: 'tags',
      beats: 7,
      duration: 3200,
      activities: [
        { text: 'Artikelliste aus Anhang wird ausgelesen' },
        { text: '7 betroffene Artikel erkannt', beat: 7, tone: 'success' },
      ],
    },
    {
      title: 'Artikelstammdaten abrufen',
      description: 'Für jeden Artikel werden die aktuellen Einkaufspreise aus dem System geholt.',
      phase: 'holen',
      icon: 'database',
      beats: 2,
      duration: 2200,
      activities: [
        { text: 'Artikelstammdaten werden abgerufen' },
        { text: 'Aktuelle Einkaufspreise geladen', beat: 1, tone: 'success' },
        { text: '1 Artikel nicht eindeutig zugeordnet', beat: 2, tone: 'warning' },
      ],
    },
    {
      title: 'Neue Werte berechnen',
      description: 'Die neuen Einkaufspreise werden mit +3,5 % berechnet.',
      phase: 'verarbeiten',
      icon: 'calc',
      duration: 1600,
      activities: [
        { text: 'Neue Preise werden berechnet (+3,5 %)' },
        { text: '6 neue Werte berechnet', beat: 1 },
      ],
    },
    {
      title: 'Plausibilität prüfen',
      description: 'Der Agent prüft jeden Wert – auffällige Datensätze werden markiert, nicht geändert.',
      phase: 'pruefen',
      icon: 'clipboard',
      beats: 3,
      duration: 2800,
      activities: [
        { text: 'Plausibilitätsprüfung läuft' },
        { text: 'Preishistorie wird abgeglichen', beat: 1 },
        { text: 'Artikel 30151 wurde bereits am 12.09. erhöht', beat: 2, tone: 'warning' },
        { text: '2 Datensätze markiert – werden nicht automatisch geändert', beat: 3, tone: 'warning' },
      ],
    },
    {
      title: 'Änderungen auflisten',
      description: 'Alle geplanten Änderungen werden übersichtlich zusammengestellt.',
      phase: 'verarbeiten',
      icon: 'tasks',
      duration: 1400,
      activities: [{ text: 'Änderungsliste erstellt: 5 Änderungen, 2 Hinweise', beat: 1, tone: 'success' }],
    },
    {
      title: 'Freigabe einholen',
      description: 'Der Einkauf entscheidet, ob die Änderungen übernommen werden.',
      phase: 'freigabe',
      icon: 'human',
      duration: 900,
      human: {
        question: '5 Preise werden geändert, 2 auffällige Artikel bleiben unverändert. Änderungen übernehmen?',
        approve: 'Änderungen freigeben',
        edit: 'Einzeln prüfen',
        editHint: 'Im echten System könnten hier einzelne Zeilen abgewählt oder korrigiert werden.',
      },
      activities: [{ text: 'Änderungsliste zur Freigabe vorgelegt' }],
    },
    {
      title: 'System aktualisieren',
      description: 'Die freigegebenen Preise werden ins System übernommen (Simulation).',
      phase: 'ergebnis',
      icon: 'system',
      beats: 5,
      duration: 2600,
      activities: [
        { text: 'Systemaktualisierung (Simulation)' },
        { text: '5 Preise aktualisiert · 2 offen beim Einkauf', beat: 5, tone: 'success' },
      ],
    },
  ],
  facts: [
    { label: 'Lieferant', value: 'Nordquell Brunnen GmbH', step: 0 },
    { label: 'Erhöhung', value: '+3,5 %', step: 0, beat: 2 },
    { label: 'Gültig ab', value: '01.11.', step: 0, beat: 2 },
    { label: 'Betroffene Artikel', value: '7', step: 1, beat: 7 },
    { label: 'Automatisch änderbar', value: '5', step: 4, beat: 3 },
    { label: 'Zur Prüfung', value: '2 Artikel', step: 4, beat: 3, tone: 'warning' },
  ],
  recap: {
    verstehen: 'Erhöhung, Stichtag und betroffene Artikel aus einem Lieferantenschreiben erkannt',
    suchen: 'Aktuelle Einkaufspreise aus den Artikelstammdaten geholt',
    strukturieren: 'Fließtext und PDF-Anlage → saubere Änderungstabelle',
    handeln: 'Neue Preise berechnet und ins System übertragen (Simulation)',
    pruefen: 'Doppelte Erhöhung und unklare Zuordnung erkannt – diese Artikel bleiben beim Einkauf',
  },
  Workspace,
  Output,
}
