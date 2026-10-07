import { Check, FileText, Loader2, Mail, ServerCog, TriangleAlert } from 'lucide-react'
import type { ScenarioDef, ScenarioProps } from '../engine/types'
import { Badge, FileChip, MarkedText, Panel, Placeholder, StatTile, cx, eur, type Seg } from '../components/ui'

const RATE = 0.035

type Row = { nr: string; name: string; old: number; flag?: string }
const ROWS: Row[] = [
  { nr: '30112', name: 'Nordquell Classic 12 × 0,7 l Glas', old: 6.8 },
  { nr: '30113', name: 'Nordquell Medium 12 × 0,7 l Glas', old: 6.8 },
  { nr: '30145', name: 'Nordquell Apfelschorle 24 × 0,33 l', old: 9.4 },
  { nr: '30151', name: 'Nordquell Classic 6 × 1,5 l PET', old: 4.04, flag: 'Erst am 12.09. erhöht – doppelte Erhöhung?' },
  { nr: '30160', name: 'Nordquell Classic 20 × 0,5 l PET', old: 7.2 },
]
const OK = ROWS.filter((r) => !r.flag).length
const round2 = (v: number) => Math.round(v * 100) / 100

const LETTER: Seg[] = [
  { text: 'Sehr geehrte Damen und Herren,\naufgrund gestiegener Kosten erhöhen wir ' },
  { text: 'zum 01.11.', at: [0, 2], tag: 'Gültig ab' },
  { text: ' die Einkaufspreise für ' },
  { text: 'ausgewählte Artikel', at: [1, 0], tag: 'Betroffen' },
  { text: ' ' },
  { text: 'um 3,5 %', at: [0, 2], tag: 'Erhöhung' },
  { text: '. Die Artikel finden Sie in der beigefügten Liste.\nMit freundlichen Grüßen\nNordquell Brunnen GmbH' },
]

function Workspace({ p }: ScenarioProps) {
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 xl:col-span-4">
        <Panel anchor={0} title="Eingang · Lieferant" icon={<Mail className="size-4" />}>
          <div className="mb-3 text-sm">
            <div className="font-semibold text-slate-800">Nordquell Brunnen GmbH</div>
            <div className="text-slate-500">Betreff: Preisanpassung zum 01.11.</div>
          </div>
          <MarkedText segs={LETTER} p={p} className="text-[1rem] leading-[2.2] whitespace-pre-line text-slate-700" />
          <div className="mt-3">
            <FileChip name="Artikelliste.pdf" meta="Anhang · 5 Artikel" kind="pdf" />
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
              p.reached(4, 2) ? (
                <span className="flex gap-1.5">
                  <Badge tone="ok">{OK} Änderungen bereit</Badge>
                  <Badge tone="warn">{ROWS.length - OK} zur Prüfung</Badge>
                </span>
              ) : undefined
            }
          >
            <table className="w-full text-[0.95rem]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-400 uppercase">
                  <th className="py-2 pr-3 font-semibold">Artikel</th>
                  <th className={cx('py-2 pr-3 text-right font-semibold transition-colors', p.active(2) && 'text-brand-600')}>Alter Preis</th>
                  <th className={cx('py-2 pr-3 text-right font-semibold transition-colors', p.active(3) && 'text-brand-600')}>Änderung</th>
                  <th className={cx('py-2 pr-3 text-right font-semibold transition-colors', p.active(3) && 'text-brand-600')}>Neuer Preis</th>
                  <th className={cx('py-2 font-semibold transition-colors', p.active(4) && 'text-brand-600')}>Status</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => {
                  if (!p.reached(1, i + 1)) return null
                  const loaded = p.reached(2, 1)
                  const calc = p.reached(3, 1)
                  const checked = p.reached(4, r.flag ? 2 : 1)
                  const warn = checked && !!r.flag
                  const okIndex = ROWS.filter((x) => !x.flag).indexOf(r)
                  const updated = !r.flag && p.reached(6, okIndex + 1)
                  return (
                    <tr key={r.nr} className={cx('border-b border-slate-100 align-top transition-colors duration-500', warn && 'bg-amber-50/80', updated && 'bg-emerald-50/50')}>
                      <td className="py-2.5 pr-3">
                        <div className="font-medium text-slate-800">{r.name}</div>
                        <div className="text-xs text-slate-400">Art.-Nr. {r.nr}</div>
                        {warn && (
                          <div className="mt-1 flex items-center gap-1 text-[0.8rem] font-medium text-amber-700">
                            <TriangleAlert className="size-3.5" /> {r.flag}
                          </div>
                        )}
                      </td>
                      <td className="tabular py-2.5 pr-3 text-right text-slate-600">{loaded ? eur(r.old) : <span className="text-slate-300">–</span>}</td>
                      <td className="tabular py-2.5 pr-3 text-right text-slate-600">{calc ? '+3,5 %' : <span className="text-slate-300">–</span>}</td>
                      <td className={cx('tabular py-2.5 pr-3 text-right font-semibold', warn ? 'text-slate-400 line-through' : 'text-slate-900')}>
                        {calc ? eur(round2(r.old * (1 + RATE))) : <span className="font-normal text-slate-300">–</span>}
                      </td>
                      <td className="py-2.5">
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
  const run = p.reached(6)
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
      title: 'Preisinfo erfassen',
      description: 'Das Lieferantenschreiben wird gelesen.',
      insight: 'Der Input ist ein ganz normales Lieferantenschreiben – so, wie es heute per E-Mail oder Post kommt.',
      phase: 'input',
      icon: 'file',
      beats: 2,
      duration: 3000,
      activities: [
        { text: 'Lieferantenschreiben eingegangen', tone: 'data' },
        { text: 'Preiserhöhung erkannt: +3,5 % ab 01.11.', beat: 2, tone: 'data' },
      ],
    },
    {
      title: 'Artikel erkennen',
      description: 'Die betroffenen Artikel werden aus der Anlage ausgelesen.',
      insight: 'Die KI versteht, welche Artikel gemeint sind – auch wenn die Liste als PDF kommt.',
      phase: 'verstehen',
      icon: 'tags',
      beats: 5,
      duration: 3500,
      activities: [{ text: '5 betroffene Artikel erkannt', beat: 5, tone: 'success' }],
    },
    {
      title: 'Aktuelle Preise abrufen',
      description: 'Für jeden Artikel wird der heutige Einkaufspreis aus dem System geholt.',
      insight: 'Der Agent holt sich die aktuellen Werte selbst aus dem System – niemand muss nachschlagen.',
      phase: 'holen',
      icon: 'database',
      duration: 2400,
      activities: [{ text: 'Aktuelle Einkaufspreise geladen', beat: 1, tone: 'success' }],
    },
    {
      title: 'Neue Preise berechnen',
      description: 'Die neuen Einkaufspreise werden mit +3,5 % berechnet.',
      insight: 'Die Rechenarbeit ist in Sekunden erledigt – für 5 Artikel genauso wie für 500.',
      phase: 'verarbeiten',
      icon: 'calc',
      duration: 2400,
      activities: [{ text: '5 neue Preise berechnet', beat: 1 }],
    },
    {
      title: 'Plausibilität prüfen',
      description: 'Der Agent prüft jeden Wert – Auffälliges wird markiert, nicht geändert.',
      insight: 'Wichtig: Unklare Fälle ändert der Agent nicht „irgendwie“, sondern markiert sie für einen Menschen.',
      phase: 'pruefen',
      icon: 'clipboard',
      beats: 2,
      duration: 3200,
      activities: [
        { text: 'Preishistorie wird geprüft' },
        { text: 'Artikel 30151 bereits erhöht – wird nicht geändert', beat: 2, tone: 'warning' },
      ],
    },
    {
      title: 'Einkauf gibt frei',
      description: 'Der Einkauf entscheidet, ob die Änderungen übernommen werden.',
      phase: 'freigabe',
      icon: 'human',
      duration: 900,
      human: {
        question: '4 Preise werden geändert, 1 auffälliger Artikel bleibt unverändert. Änderungen übernehmen?',
        approve: 'Änderungen freigeben',
        edit: 'Einzeln prüfen',
        editHint: 'Im echten System könnten hier einzelne Zeilen abgewählt oder korrigiert werden.',
      },
      activities: [],
    },
    {
      title: 'System aktualisieren',
      description: 'Die freigegebenen Preise werden übernommen (Simulation).',
      phase: 'ergebnis',
      icon: 'system',
      beats: 4,
      duration: 2800,
      activities: [{ text: '4 Preise aktualisiert · 1 offen beim Einkauf', beat: 4, tone: 'success' }],
    },
  ],
  facts: [
    { label: 'Lieferant', value: 'Nordquell Brunnen GmbH', step: 0 },
    { label: 'Erhöhung', value: '+3,5 %', step: 0, beat: 2 },
    { label: 'Gültig ab', value: '01.11.', step: 0, beat: 2 },
    { label: 'Betroffene Artikel', value: '5', step: 1, beat: 5 },
    { label: 'Zur Prüfung', value: '1 Artikel', step: 4, beat: 2, tone: 'warning' },
  ],
  recap: {
    verstehen: 'Erhöhung, Stichtag und betroffene Artikel aus einem Lieferantenschreiben erkannt',
    suchen: 'Aktuelle Einkaufspreise aus den Artikelstammdaten geholt',
    strukturieren: 'Fließtext und PDF-Anlage → saubere Änderungstabelle',
    handeln: 'Neue Preise berechnet und ins System übertragen (Simulation)',
    pruefen: 'Doppelte Erhöhung erkannt – dieser Artikel bleibt beim Einkauf',
  },
  Workspace,
  Output,
}
