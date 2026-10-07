import { useEffect } from 'react'
import { Archive, Check, FileText, Mail, Paperclip, Send, UserRound } from 'lucide-react'
import type { ScenarioDef, ScenarioProps } from '../engine/types'
import { createStore } from '../engine/store'
import { Badge, MarkedText, Panel, Placeholder, Reveal, Typewriter, cx, fmtDay, fmtShort, lastWeekday, type Seg } from '../components/ui'

const THURSDAY = lastWeekday(4)

const EMAIL: Seg[] = [
  { text: 'Guten Morgen,\nkönnten Sie mir bitte noch einmal ' },
  { text: 'den Lieferschein', at: [1, 2], tag: 'Dokumenttyp' },
  { text: ' zur ' },
  { text: 'Bestellung 10572', at: [1, 3], tag: 'Bestellnummer' },
  { text: ' ' },
  { text: 'vom vergangenen Donnerstag', at: [1, 4], tag: 'Datum' },
  { text: ' ' },
  { text: 'zusenden', at: [1, 1], tag: 'Anliegen' },
  { text: '?\nVielen Dank.\nMartina Krüger · Landhaus am See' },
]

const REPLY = `Guten Morgen Frau Krüger,

gerne senden wir Ihnen den Lieferschein zu Ihrer Bestellung 10572 vom ${fmtDay(THURSDAY)} erneut zu. Sie finden ihn im Anhang dieser E-Mail.

Freundliche Grüße
Ihr Kundenservice`

const replyStore = createStore(REPLY)

const DOCS = [
  { name: 'Rechnung_10572.pdf', match: false },
  { name: 'Lieferschein_10568.pdf', match: false },
  { name: 'Lieferschein_10572.pdf', match: true },
  { name: 'Auftragsbestätigung_10572.pdf', match: false },
]

function Workspace({ p }: ScenarioProps) {
  useEffect(() => replyStore.reset(), [])
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 xl:col-span-5">
        <Panel anchor={0} title="Eingang · E-Mail" icon={<Mail className="size-4" />} aside={<Badge tone={p.reached(0) ? 'brand' : 'neutral'}>Heute, 08:12 Uhr</Badge>}>
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
          <MarkedText segs={EMAIL} p={p} className="mt-5 text-[1.05rem] leading-[2.3] whitespace-pre-line text-slate-700" />
        </Panel>
      </div>

      <div className="col-span-12 xl:col-span-7">
        {p.reached(2) ? (
          <Reveal show>
            <Panel anchor={2} title="Kunde & Dokumentenarchiv" icon={<Archive className="size-4" />} aside={p.reached(2, 3) ? <Badge tone="ok">1 Treffer</Badge> : undefined}>
              <Reveal show={p.reached(2, 1)}>
                <div className="mb-4 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                  <UserRound className="size-5 text-brand-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">Landhaus am See</div>
                    <div className="text-sm text-slate-500">Kundennummer 20418 · Absender ist hinterlegter Ansprechpartner</div>
                  </div>
                  <Check className="size-5 text-emerald-600" />
                </div>
              </Reveal>
              {p.reached(2, 2) && (
                <Reveal show>
                  <div className="mb-2 flex flex-wrap gap-1.5 text-xs">
                    <Badge tone="neutral">Dokumente des Kunden</Badge>
                    {p.reached(2, 3) && <Badge tone="brand">Filter: Lieferschein · Bestellung 10572</Badge>}
                  </div>
                  <ul className="relative space-y-1.5 overflow-hidden">
                    {DOCS.map((d) => {
                      const out = p.reached(2, 3) && !d.match
                      const hit = d.match && p.reached(2, 3)
                      return (
                        <li
                          key={d.name}
                          className={cx(
                            'flex items-center gap-3 rounded-lg border px-3 py-2 text-[0.95rem] transition-all duration-700',
                            hit ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 bg-white',
                            out && 'opacity-35',
                          )}
                        >
                          <FileText className={cx('size-4', hit ? 'text-emerald-600' : 'text-slate-400')} />
                          <span className={cx('flex-1 font-medium', out ? 'text-slate-400 line-through' : 'text-slate-700')}>{d.name}</span>
                          {hit && <Badge tone="ok">Treffer</Badge>}
                        </li>
                      )
                    })}
                    {p.active(2) && !p.reached(2, 3) && (
                      <div className="animate-scan pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-brand-100/60 to-transparent" />
                    )}
                  </ul>
                </Reveal>
              )}
            </Panel>
          </Reveal>
        ) : (
          <Placeholder className="py-6">Kunde & Archiv · der passende Lieferschein wird gesucht</Placeholder>
        )}
      </div>
    </div>
  )
}

function Output({ p }: ScenarioProps) {
  const reply = replyStore.use()
  const sent = p.reached(6, 1)
  const status = sent ? <Badge tone="ok">Versendet</Badge> : p.status === 'awaiting' ? <Badge tone="human">Wartet auf Freigabe</Badge> : <Badge tone="brand">Entwurf</Badge>
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        <div className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
          <Send className="size-5" />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">E-Mail-Entwurf · an Martina Krüger</div>
          <div className="text-xl font-semibold text-slate-900">AW: Lieferschein</div>
        </div>
        <div className="ml-auto">{status}</div>
      </div>
      <div className="grid gap-6 px-6 py-5 lg:grid-cols-[1fr_minmax(0,19rem)]">
        <div>
          {p.editing ? (
            <textarea
              autoFocus
              value={reply}
              onChange={(e) => replyStore.set(e.target.value)}
              className="h-48 w-full resize-none rounded-lg border border-human-200 bg-human-50/40 p-3 text-[1rem] leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-human-200"
            />
          ) : (
            <p className="min-h-[10rem] text-[1rem] leading-relaxed whitespace-pre-line text-slate-800">
              <Typewriter text={reply} show active={p.active(3)} ms={p.stepMs(3) * 0.75} />
            </p>
          )}
          <Reveal show={p.reached(3, 2)} className="mt-4">
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

        {/* 5 · Prüfen: vor dem Versand */}
        <div className={cx('rounded-xl border p-4 transition-shadow duration-500', p.active(4) ? 'border-brand-300 ring-2 ring-brand-100' : 'border-slate-200')}>
          <div className="mb-2 text-[0.72rem] font-semibold tracking-[0.12em] text-slate-400 uppercase">Prüfung vor dem Versand</div>
          {p.reached(4) ? (
            <div className="space-y-2 text-[0.95rem]">
              {[
                ['Kunde', '20418 = 20418'],
                ['Bestellung', '10572 = 10572'],
                ['Datum', `${fmtShort(THURSDAY)} = ${fmtShort(THURSDAY)}`],
              ].map(([k, v], i) => (
                <Reveal key={k} show={p.reached(4, i + 1)}>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-600" />
                    <span className="w-24 font-medium text-slate-700">{k}</span>
                    <span className="text-slate-500">{v}</span>
                  </div>
                </Reveal>
              ))}
              <Reveal show={p.reached(4, 3)} className="pt-1">
                <Badge tone="ok" icon={<Check className="size-3" />}>
                  Dokument eindeutig – passt zum Kunden
                </Badge>
              </Reveal>
            </div>
          ) : (
            <div className="text-sm text-slate-400">folgt nach dem Entwurf</div>
          )}
        </div>
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
  outputFrom: 3,
  next: 'price',
  steps: [
    {
      title: 'E-Mail empfangen',
      description: 'Im Service-Postfach geht eine Kundenanfrage ein.',
      insight: 'Der Auslöser ist ganz alltäglich: eine frei formulierte E-Mail – kein Formular, kein Ticket.',
      phase: 'input',
      icon: 'mail',
      duration: 1800,
      activities: [{ text: 'Neue E-Mail im Service-Postfach', tone: 'data' }],
    },
    {
      title: 'Anfrage verstehen',
      description: 'Die KI erkennt Anliegen, Dokumenttyp, Bestellnummer und Datum.',
      insight: 'Aus einem Satz wird ein klarer Auftrag – auch „vergangener Donnerstag“ wird zu einem echten Datum.',
      phase: 'verstehen',
      icon: 'brain',
      beats: 4,
      duration: 4400,
      activities: [
        { text: 'E-Mail wird gelesen' },
        { text: 'Anfrage verstanden: Lieferschein #10572 erneut senden', beat: 4, tone: 'success' },
      ],
    },
    {
      title: 'Lieferschein suchen',
      description: 'Der Agent identifiziert den Kunden und durchsucht dessen Dokumente.',
      insight: 'Statt im Archiv zu klicken und zu filtern, findet der Agent genau das eine passende Dokument.',
      phase: 'holen',
      icon: 'search',
      beats: 3,
      duration: 4200,
      activities: [
        { text: 'Kunde wird identifiziert' },
        { text: 'Kunde: Landhaus am See', beat: 1, tone: 'success' },
        { text: 'Archiv wird durchsucht', beat: 2 },
        { text: '1 passendes Dokument gefunden', beat: 3, tone: 'success' },
      ],
    },
    {
      title: 'Antwort vorbereiten',
      description: 'Eine freundliche Antwort mit dem Lieferschein im Anhang entsteht.',
      insight: 'Die Antwort ist fertig formuliert – inklusive Anhang. Niemand musste etwas abtippen.',
      phase: 'verarbeiten',
      icon: 'pen',
      beats: 2,
      duration: 4000,
      activities: [
        { text: 'Antwort wird formuliert' },
        { text: 'Lieferschein angehängt', beat: 2, tone: 'success' },
      ],
    },
    {
      title: 'Vor dem Versand prüfen',
      description: 'Kunde, Bestellung und Datum werden gegeneinander abgeglichen.',
      insight: 'Bevor etwas das Haus verlässt, prüft der Agent: Gehört dieses Dokument wirklich zu diesem Kunden?',
      phase: 'pruefen',
      icon: 'compare',
      beats: 3,
      duration: 3000,
      activities: [{ text: 'Prüfung erfolgreich · Dokument eindeutig', beat: 3, tone: 'success' }],
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
      activities: [],
    },
    {
      title: 'E-Mail versenden',
      description: 'Der Kunde erhält seinen Lieferschein.',
      phase: 'ergebnis',
      icon: 'send',
      duration: 1800,
      activities: [{ text: 'E-Mail mit Lieferschein versendet', beat: 1, tone: 'success' }],
    },
  ],
  facts: [
    { label: 'Anliegen', value: 'Dokument erneut senden', step: 1, beat: 1 },
    { label: 'Dokumenttyp', value: 'Lieferschein', step: 1, beat: 2 },
    { label: 'Bestellnummer', value: '#10572', step: 1, beat: 3 },
    { label: 'Datum', value: fmtShort(THURSDAY), step: 1, beat: 4 },
    { label: 'Kunde', value: 'Landhaus am See', step: 2, beat: 1 },
    { label: 'Dokument', value: 'Lieferschein_10572.pdf', step: 2, beat: 3 },
  ],
  recap: {
    verstehen: 'Anliegen, Dokumenttyp, Bestellnummer und Datum aus einer frei formulierten E-Mail erkannt',
    suchen: 'Kunden identifiziert und im Archiv den richtigen Lieferschein gefunden',
    strukturieren: 'Aus „vergangener Donnerstag“ wurde ein konkretes Datum und ein eindeutiger Suchauftrag',
    handeln: 'Antwort formuliert, Dokument angehängt und Versand vorbereitet',
    pruefen: 'Kunde, Bestellung und Datum gegengeprüft – versendet wird erst nach Freigabe',
  },
  Workspace,
  Output,
}
