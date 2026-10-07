import { useEffect } from 'react'
import { Archive, Check, FileText, Mail, Paperclip, Send, UserRound } from 'lucide-react'
import type { ScenarioDef, ScenarioProps } from '../engine/types'
import { createStore } from '../engine/store'
import { Badge, MarkedText, Panel, Placeholder, Reveal, SystemChip, Typewriter, chipState, cx, fmtDay, fmtShort, lastWeekday, type Seg } from '../components/ui'

const THURSDAY = lastWeekday(4)

const EMAIL: Seg[] = [
  { text: 'Guten Morgen,\nkönnten Sie mir bitte noch einmal ' },
  { text: 'den Lieferschein', at: [1, 2], tag: 'Dokumenttyp' },
  { text: ' zur ' },
  { text: 'Bestellung 10572', at: [2, 1], tag: 'Bestellnummer' },
  { text: ' ' },
  { text: 'vom vergangenen Donnerstag', at: [2, 2], tag: 'Datum' },
  { text: ' ' },
  { text: 'zusenden', at: [1, 1], tag: 'Anliegen' },
  { text: '?\nVielen Dank.\nMartina Krüger · Landhaus am See' },
]

const REPLY = `Guten Morgen Frau Krüger,

gerne senden wir Ihnen den Lieferschein zu Ihrer Bestellung 10572 vom ${fmtDay(THURSDAY)} erneut zu. Sie finden ihn im Anhang dieser E-Mail.

Bei Fragen sind wir jederzeit gerne für Sie da.

Freundliche Grüße
Ihr Kundenservice`

const replyStore = createStore(REPLY)

const DOCS = [
  { name: 'Rechnung_10572.pdf', type: 'Rechnung', order: '10572' },
  { name: 'Lieferschein_10568.pdf', type: 'Lieferschein', order: '10568' },
  { name: 'Auftragsbestätigung_10572.pdf', type: 'Auftragsbestätigung', order: '10572' },
  { name: 'Lieferschein_10572.pdf', type: 'Lieferschein', order: '10572', match: true },
  { name: 'Gutschrift_10551.pdf', type: 'Gutschrift', order: '10551' },
  { name: 'Lieferschein_10575.pdf', type: 'Lieferschein', order: '10575' },
]

function Workspace({ p }: ScenarioProps) {
  useEffect(() => replyStore.reset(), [])
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 xl:col-span-5">
        <Panel title="Eingang · E-Mail" icon={<Mail className="size-4" />} aside={<Badge tone={p.reached(0) ? 'brand' : 'neutral'}>Heute, 08:12 Uhr</Badge>}>
          <div className="space-y-1 border-b border-slate-100 pb-3 text-sm">
            <div>
              <span className="text-slate-400">Von: </span>
              <span className="font-semibold text-slate-800">Martina Krüger</span> <span className="text-slate-500">&lt;einkauf@landhaus-am-see.example&gt;</span>
            </div>
            <div>
              <span className="text-slate-400">Betreff: </span>
              <span className="font-medium text-slate-800">Lieferschein</span>
            </div>
          </div>
          <MarkedText segs={EMAIL} p={p} className="mt-5 text-[1.05rem] leading-[2.2] whitespace-pre-line text-slate-700" />
        </Panel>
      </div>

      <div className="col-span-12 space-y-4 xl:col-span-7">
        {p.reached(3) ? (
          <Reveal show>
            <Panel anchor={3} title="Kunde" icon={<UserRound className="size-4" />} aside={<SystemChip label="Kundenstamm" state={chipState(p, 3, 1)} />}>
              <Reveal show={p.reached(3, 1)}>
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">Landhaus am See</div>
                    <div className="text-sm text-slate-500">Kundennummer 20418 · Gastronomie</div>
                  </div>
                  <Reveal show={p.reached(3, 2)}>
                    <Badge tone="ok" icon={<Check className="size-3" />}>
                      Absender ist hinterlegter Ansprechpartner
                    </Badge>
                  </Reveal>
                </div>
              </Reveal>
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Kunde · wird über den Absender identifiziert</Placeholder>
        )}

        {p.reached(4) ? (
          <Reveal show>
            <Panel
              anchor={4}
              title="Dokumentenarchiv"
              icon={<Archive className="size-4" />}
              aside={p.reached(5, 1) ? <Badge tone="ok">1 Treffer</Badge> : <SystemChip label="Suche läuft" state="loading" />}
            >
              <div className="mb-2 flex flex-wrap gap-1.5 text-xs">
                <Badge tone="neutral">Kunde 20418</Badge>
                <Badge tone="neutral">Zeitraum: letzte 14 Tage · 38 Dokumente</Badge>
                {p.reached(4, 2) && <Badge tone="brand">Typ: Lieferschein</Badge>}
                {p.reached(4, 3) && <Badge tone="brand">Bestellung: 10572</Badge>}
              </div>
              <ul className="relative space-y-1 overflow-hidden">
                {DOCS.map((d) => {
                  const outType = p.reached(4, 2) && d.type !== 'Lieferschein'
                  const outOrder = p.reached(4, 3) && d.order !== '10572'
                  const out = outType || outOrder
                  const hit = d.match && p.reached(5, 1)
                  return (
                    <li
                      key={d.name}
                      className={cx(
                        'flex items-center gap-3 rounded-lg border px-3 py-1.5 text-sm transition-all duration-500',
                        hit ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 bg-white',
                        out && 'opacity-35',
                      )}
                    >
                      <FileText className={cx('size-4', hit ? 'text-emerald-600' : 'text-slate-400')} />
                      <span className={cx('flex-1 font-medium', out ? 'text-slate-400 line-through' : 'text-slate-700')}>{d.name}</span>
                      <span className="text-xs text-slate-400">{d.type}</span>
                      {hit && <Badge tone="ok">Treffer</Badge>}
                    </li>
                  )
                })}
                {p.active(4) && <div className="animate-scan pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-brand-100/60 to-transparent" />}
              </ul>
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Dokumentenarchiv · Suche nach dem passenden Lieferschein</Placeholder>
        )}

        {p.reached(6) ? (
          <Reveal show>
            <Panel anchor={6} title="Gegenprüfung" icon={<Check className="size-4" />}>
              <div className="grid gap-2 text-sm">
                {[
                  ['Kundennummer', 'Anfrage: 20418', 'Dokument: 20418'],
                  ['Bestellnummer', 'Anfrage: 10572', 'Dokument: 10572'],
                  ['Lieferdatum', `Anfrage: ${fmtShort(THURSDAY)}`, `Dokument: ${fmtShort(THURSDAY)}`],
                ].map(([k, a, b], i) => (
                  <Reveal key={k} show={p.reached(6, i + 1)}>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="w-32 font-medium text-slate-700">{k}</span>
                      <span className="flex-1 text-slate-500">{a}</span>
                      <span className="flex-1 text-slate-500">{b}</span>
                      <Check className="size-4 text-emerald-600" />
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal show={p.reached(6, 3)} className="mt-3">
                <Badge tone="ok" icon={<Check className="size-3" />}>
                  Dokument eindeutig gefunden
                </Badge>
              </Reveal>
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Gegenprüfung · Kunde und Dokument werden abgeglichen</Placeholder>
        )}
      </div>
    </div>
  )
}

function Output({ p }: ScenarioProps) {
  const reply = replyStore.use()
  const sent = p.reached(9, 1)
  const status = sent ? <Badge tone="ok">Versendet</Badge> : p.status === 'awaiting' ? <Badge tone="human">Wartet auf Freigabe</Badge> : <Badge tone="brand">Entwurf</Badge>
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        <div className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
          <Send className="size-5" />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">E-Mail-Entwurf</div>
          <div className="text-xl font-semibold text-slate-900">AW: Lieferschein</div>
        </div>
        <div className="ml-auto">{status}</div>
      </div>
      <div className="px-6 py-5">
        <div className="mb-4 space-y-1 text-sm">
          <div>
            <span className="text-slate-400">An: </span>
            <span className="font-medium text-slate-800">Martina Krüger &lt;einkauf@landhaus-am-see.example&gt;</span>
          </div>
        </div>
        {p.editing ? (
          <textarea
            autoFocus
            value={reply}
            onChange={(e) => replyStore.set(e.target.value)}
            className="h-56 w-full resize-none rounded-lg border border-human-200 bg-human-50/40 p-3 text-[1rem] leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-human-200"
          />
        ) : (
          <p className="min-h-[12rem] text-[1rem] leading-relaxed whitespace-pre-line text-slate-800">
            <Typewriter text={reply} show active={p.active(7)} ms={p.stepMs(7) * 0.9} />
          </p>
        )}
        <Reveal show={p.reached(7, 2)} className="mt-4">
          <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Paperclip className="size-4 text-slate-400" />
            <span className="grid size-8 place-items-center rounded-lg bg-rose-50 text-rose-600">
              <FileText className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-800">Lieferschein_10572.pdf</span>
              <span className="block text-xs text-slate-500">1 Seite · 84 KB</span>
            </span>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

export const documentScenario: ScenarioDef = {
  id: 'document',
  name: 'Document Service Agent',
  subtitle: 'Rechnungen und Lieferscheine automatisch finden und versenden',
  origin: 'Lieferschein/Rechnung versenden',
  icon: 'file',
  source: 'E-Mail',
  clockStart: 8 * 3600 + 12 * 60 + 4,
  outputTitle: 'E-Mail mit Lieferschein',
  outputFrom: 7,
  next: 'price',
  steps: [
    {
      title: 'E-Mail empfangen',
      description: 'Im Service-Postfach geht eine Kundenanfrage ein.',
      phase: 'input',
      icon: 'mail',
      duration: 1300,
      activities: [{ text: 'Neue E-Mail im Service-Postfach', tone: 'data' }],
    },
    {
      title: 'Anfrage verstehen',
      description: 'Die KI liest die E-Mail und erkennt, was der Kunde möchte.',
      phase: 'verstehen',
      icon: 'brain',
      beats: 2,
      duration: 2400,
      activities: [
        { text: 'E-Mail wird gelesen' },
        { text: 'Kundenanfrage erkannt: Dokument erneut senden', beat: 1, tone: 'data' },
        { text: 'Gesuchtes Dokument: Lieferschein', beat: 2, tone: 'data' },
      ],
    },
    {
      title: 'Bestellnummer erkennen',
      description: 'Bestellnummer und Zeitraum werden aus dem Text herausgelesen.',
      phase: 'verstehen',
      icon: 'hash',
      beats: 2,
      duration: 2200,
      activities: [
        { text: 'Bestellnummer gefunden: #10572', beat: 1, tone: 'data' },
        { text: 'Zeitraum: vergangener Donnerstag', beat: 2, tone: 'data' },
      ],
    },
    {
      title: 'Kunde identifizieren',
      description: 'Der Absender wird im Kundenstamm gesucht.',
      phase: 'holen',
      icon: 'customer',
      beats: 2,
      duration: 2200,
      activities: [
        { text: 'Absender wird im Kundenstamm gesucht' },
        { text: 'Kunde identifiziert: Landhaus am See', beat: 1, tone: 'success' },
        { text: 'Absender ist als Ansprechpartner hinterlegt', beat: 2, tone: 'success' },
      ],
    },
    {
      title: 'Dokumentenarchiv durchsuchen',
      description: 'Der Agent durchsucht die Dokumente des Kunden und filtert nach Typ und Bestellnummer.',
      phase: 'holen',
      icon: 'search',
      beats: 3,
      duration: 3200,
      activities: [
        { text: 'Suche passende Dokumente' },
        { text: '38 Dokumente des Kunden im Zeitraum', beat: 1 },
        { text: 'Filter: nur Lieferscheine', beat: 2 },
        { text: 'Filter: Bestellung 10572', beat: 3 },
      ],
    },
    {
      title: 'Lieferschein finden',
      description: 'Genau ein Dokument passt zu allen Kriterien.',
      phase: 'holen',
      icon: 'fileSearch',
      duration: 1400,
      activities: [{ text: '1 passendes Dokument gefunden', beat: 1, tone: 'success' }],
    },
    {
      title: 'Kunde & Dokument prüfen',
      description: 'Bevor etwas versendet wird, gleicht der Agent Kunde, Bestellung und Datum gegeneinander ab.',
      phase: 'pruefen',
      icon: 'compare',
      beats: 3,
      duration: 2700,
      activities: [
        { text: 'Kundennummer stimmt überein', beat: 1, tone: 'success' },
        { text: 'Bestellnummer stimmt überein', beat: 2, tone: 'success' },
        { text: 'Prüfung erfolgreich · Dokument eindeutig gefunden', beat: 3, tone: 'success' },
      ],
    },
    {
      title: 'E-Mail vorbereiten',
      description: 'Eine freundliche Antwort mit dem Lieferschein als Anhang wird formuliert.',
      phase: 'verarbeiten',
      icon: 'pen',
      beats: 2,
      duration: 3400,
      activities: [
        { text: 'Antwort wird formuliert' },
        { text: 'Lieferschein_10572.pdf angehängt', beat: 2, tone: 'success' },
      ],
    },
    {
      title: 'Versand freigeben',
      description: 'Der Mitarbeiter prüft den Entwurf und gibt den Versand frei.',
      phase: 'freigabe',
      icon: 'human',
      duration: 900,
      human: {
        question: 'Passt der Entwurf? Erst nach Freigabe wird die E-Mail an den Kunden versendet.',
        approve: 'Versand freigeben',
        edit: 'Bearbeiten',
      },
      activities: [{ text: 'E-Mail-Entwurf zur Prüfung bereit' }],
    },
    {
      title: 'E-Mail versendet',
      description: 'Der Kunde erhält seinen Lieferschein – ohne Suchen, ohne Abtippen.',
      phase: 'ergebnis',
      icon: 'send',
      duration: 1500,
      activities: [
        { text: 'E-Mail wird versendet' },
        { text: 'E-Mail mit Lieferschein versendet', beat: 1, tone: 'success' },
      ],
    },
  ],
  facts: [
    { label: 'Anliegen', value: 'Dokument erneut senden', step: 1, beat: 1 },
    { label: 'Dokumenttyp', value: 'Lieferschein', step: 1, beat: 2 },
    { label: 'Bestellnummer', value: '#10572', step: 2, beat: 1 },
    { label: 'Datum', value: fmtShort(THURSDAY), step: 2, beat: 2 },
    { label: 'Kunde', value: 'Landhaus am See', step: 3, beat: 1 },
    { label: 'Kundennummer', value: '20418', step: 3, beat: 1 },
    { label: 'Dokument', value: 'Lieferschein_10572.pdf', step: 5, beat: 1 },
    { label: 'Status', value: 'Dokument eindeutig gefunden', step: 6, beat: 3 },
  ],
  recap: {
    verstehen: 'Anliegen, Dokumenttyp, Bestellnummer und Datum aus einer frei formulierten E-Mail erkannt',
    suchen: 'Kunden identifiziert und im Archiv unter 38 Dokumenten den richtigen Lieferschein gefunden',
    strukturieren: 'Aus „vergangener Donnerstag“ wurde ein konkretes Datum und ein eindeutiger Suchauftrag',
    handeln: 'Antwort formuliert, Dokument angehängt und Versand vorbereitet',
    pruefen: 'Kunde, Bestellung und Datum gegengeprüft – versendet wird erst nach Freigabe',
  },
  Workspace,
  Output,
}
