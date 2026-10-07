import { useEffect } from 'react'
import { CalendarClock, CheckSquare, Database, History, Phone, Square, UserRound } from 'lucide-react'
import type { ScenarioDef, ScenarioProps } from '../engine/types'
import { createStore } from '../engine/store'
import { Badge, Label, MarkedText, Panel, Placeholder, Reveal, SystemChip, Typewriter, chipState, cx, useTween, type Seg } from '../components/ui'

const SUMMARY =
  'Herr Schneider vom Restaurant Hafenblick bestellt für Freitag erneut auf Basis der Lieferung der Vorwoche. Die Wassermenge soll um fünf Kisten erhöht werden. Lieferung möglichst vor 11 Uhr. Zusätzlich soll die Verfügbarkeit eines Kühlwagens für das Wochenende geprüft werden.'

const TASKS = [
  'Lieferung der Vorwoche als Basis öffnen',
  'Wassermenge um fünf Kisten erhöhen',
  'Lieferzeit vor 11 Uhr berücksichtigen',
  'Kühlwagen-Verfügbarkeit prüfen',
  'Kunden anschließend informieren',
]

const summaryStore = createStore(SUMMARY)

/** Transkript: `at` = [Schritt, Teilschritt], in dem die Stelle erkannt wird. */
const TRANSCRIPT: Seg[] = [
  { text: '„Guten Morgen, ' },
  { text: 'Schneider', at: [1, 2], tag: 'Ansprechpartner' },
  { text: ' vom ' },
  { text: 'Hafenblick', at: [1, 1], tag: 'Kunde' },
  { text: '. Wir würden ' },
  { text: 'für Freitag', at: [1, 3], tag: 'Termin' },
  { text: ' gerne noch einmal ' },
  { text: 'die gleiche Lieferung wie letzte Woche', at: [1, 5], tag: 'Referenz' },
  { text: ' bekommen. Bei den ' },
  { text: 'Wasserflaschen brauchen wir diesmal allerdings fünf Kisten mehr', at: [1, 6], tag: 'Änderung' },
  { text: '. Und könnten Sie bitte prüfen, ' },
  { text: 'ob der Kühlwagen am Wochenende noch verfügbar ist', at: [1, 7], tag: 'Zusatzanfrage' },
  { text: '? Die Lieferung wäre idealerweise ' },
  { text: 'vor 11 Uhr', at: [1, 4], tag: 'Lieferzeit' },
  { text: '.“' },
]

const ORDER = [
  { name: 'Mineralwasser Classic 12 × 0,7 l Glas', qty: 20, unit: 'Kisten', water: true },
  { name: 'Mineralwasser Medium 12 × 0,7 l Glas', qty: 12, unit: 'Kisten' },
  { name: 'Apfelschorle 24 × 0,33 l', qty: 6, unit: 'Kisten' },
  { name: 'Orangensaft 6 × 1,0 l', qty: 8, unit: 'Kisten' },
  { name: 'Pils 50 l KEG', qty: 4, unit: 'Fässer' },
]

function Waveform({ live }: { live: boolean }) {
  return (
    <div className="flex h-12 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: 44 }, (_, i) => {
        const h = 30 + ((i * 37) % 70)
        return (
          <span
            key={i}
            className={cx('w-[4px] origin-center rounded-full transition-colors duration-500', live ? 'animate-wave bg-brand-500' : 'bg-slate-300')}
            style={{ height: `${h}%`, animationDelay: `${(i % 11) * 0.08}s`, transform: live ? undefined : 'scaleY(0.6)' }}
          />
        )
      })}
    </div>
  )
}

function Transcript({ p }: ScenarioProps) {
  const typed = useTween(p.reached(0), p.stepMs(0) * 0.92, p.reached(1))
  if (!p.reached(0)) return <Placeholder>Transkript erscheint, sobald das Gespräch verarbeitet wird.</Placeholder>
  return <MarkedText segs={TRANSCRIPT} p={p} typed={typed} className="text-[1.05rem] leading-[2.4] text-slate-700" />
}

function Workspace({ p }: ScenarioProps) {
  const summary = summaryStore.use()
  useEffect(() => summaryStore.reset(), [])
  const live = p.active(0)

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 space-y-4 xl:col-span-5">
        <Panel title="Eingang · Telefon" icon={<Phone className="size-4" />} aside={<Badge tone={live ? 'brand' : 'neutral'}>{live ? 'wird verarbeitet' : p.reached(0) ? 'Anruf beendet' : 'eingehend'}</Badge>}>
          <div className="flex items-center gap-4">
            <div className={cx('grid size-14 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700', !p.reached(0) && 'animate-soft-pulse')}>
              <Phone className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-semibold text-slate-900">Restaurant Hafenblick</div>
              <div className="text-sm text-slate-500">Herr Schneider · Dauer 03:42 Min.</div>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 px-3">
            <Waveform live={live} />
          </div>
          <div className="mt-5">
            <div className="mb-3">
              <Label>Transkript (Ausschnitt)</Label>
            </div>
            <Transcript p={p} />
          </div>
        </Panel>
      </div>

      <div className="col-span-12 space-y-4 xl:col-span-7">
        {/* Kundenhistorie */}
        {p.reached(2) ? (
          <Reveal show>
            <Panel anchor={2} title="Kundenhistorie" icon={<History className="size-4" />}>
              <div className="flex flex-wrap gap-2">
                <SystemChip label="Kundendaten" state={chipState(p, 2, 1)} icon={<Database className="size-3.5" />} />
                <SystemChip label="Letzte Bestellungen" state={chipState(p, 2, 2)} icon={<Database className="size-3.5" />} />
              </div>
              <Reveal show={p.reached(2, 2)} className="mt-3">
                <div className="rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-sm">
                    <span className="font-semibold text-slate-800">Letzte Lieferung: Bestellung #K-10482</span>
                    <span className="text-slate-500">Freitag letzter Woche · 09:40 Uhr</span>
                  </div>
                  <ul className="divide-y divide-slate-100 text-sm">
                    {ORDER.map((o) => {
                      const changed = o.water && p.reached(4, 2)
                      return (
                        <li key={o.name} className={cx('flex items-center justify-between px-3 py-1.5 transition-colors', changed && 'bg-amber-50')}>
                          <span className="text-slate-700">{o.name}</span>
                          <span className="tabular flex items-center gap-2 text-slate-600">
                            {changed ? (
                              <>
                                <span className="text-slate-400 line-through">{o.qty}</span>
                                <span className="font-semibold text-slate-900">{o.qty + 5} {o.unit}</span>
                                <Badge tone="warn">+5</Badge>
                              </>
                            ) : (
                              <span>
                                {o.qty} {o.unit}
                              </span>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </Reveal>
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Kundenhistorie · wird abgerufen, sobald der Kunde erkannt ist</Placeholder>
        )}

        {/* Zusammenfassung */}
        {p.reached(3) ? (
          <Reveal show>
            <Panel anchor={3} title="KI-Zusammenfassung" icon={<UserRound className="size-4" />} aside={p.editing ? <Badge tone="human">wird bearbeitet</Badge> : summary !== SUMMARY ? <Badge tone="human">vom Mitarbeiter angepasst</Badge> : undefined}>
              {p.editing ? (
                <textarea
                  autoFocus
                  value={summary}
                  onChange={(e) => summaryStore.set(e.target.value)}
                  className="h-32 w-full resize-none rounded-lg border border-human-200 bg-human-50/40 p-3 text-[1rem] leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-human-200"
                />
              ) : (
                <p className="text-[1rem] leading-relaxed text-slate-800">
                  <Typewriter text={summary} show active={p.active(3)} ms={p.stepMs(3) * 0.9} />
                </p>
              )}
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Zusammenfassung · entsteht aus Gespräch und Kundenhistorie</Placeholder>
        )}

        {/* Aufgaben */}
        {p.reached(4) ? (
          <Reveal show>
            <Panel anchor={4} title="Erkannte Aufgaben" icon={<CalendarClock className="size-4" />}>
              <ul className="space-y-1.5">
                {TASKS.map((t, i) => (
                  <Reveal key={t} show={p.reached(4, i + 1)}>
                    <li className="flex items-center gap-2.5 text-[0.98rem] text-slate-800">
                      {p.finished ? <CheckSquare className="size-4.5 text-emerald-600" /> : <Square className="size-4.5 text-slate-400" />}
                      {t}
                      {i === 3 && <Badge tone="human">Rückfrage Disposition</Badge>}
                    </li>
                  </Reveal>
                ))}
              </ul>
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Aufgaben · werden aus dem Gespräch abgeleitet</Placeholder>
        )}
      </div>
    </div>
  )
}

function Output({ p }: ScenarioProps) {
  const summary = summaryStore.use()
  const released = p.reached(6, 2)
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        <div className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
          <Phone className="size-5" />
        </div>
        <div>
          <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">CRM · Gesprächsnotiz</div>
          <div className="text-xl font-semibold text-slate-900">Gesprächsnotiz – Restaurant Hafenblick</div>
        </div>
        <div className="ml-auto">
          {released ? <Badge tone="ok">Zur Weiterbearbeitung freigegeben</Badge> : <Badge tone="brand">wird gespeichert …</Badge>}
        </div>
      </div>
      <div className="grid gap-6 px-6 py-5 md:grid-cols-[minmax(0,14rem)_1fr]">
        <dl className="space-y-3 text-sm">
          {[
            ['Datum', 'Heute, 10:34 Uhr'],
            ['Ansprechpartner', 'Herr Schneider'],
            ['Kanal', 'Telefon · 03:42 Min.'],
            ['Referenz', 'Bestellung #K-10482'],
            ['Liefertermin', 'Freitag, vor 11:00 Uhr'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-slate-400">{k}</dt>
              <dd className="font-medium text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="space-y-5">
          <div>
            <Label>Zusammenfassung</Label>
            <p className="text-[1.02rem] leading-relaxed text-slate-800">{summary}</p>
          </div>
          <div>
            <Label>Offene Aufgaben</Label>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {TASKS.map((t) => (
                <li key={t} className="flex items-center gap-2 text-slate-700">
                  <Square className="size-4 text-slate-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export const callScenario: ScenarioDef = {
  id: 'call',
  name: 'AI Call Assistant',
  subtitle: 'Kundenanruf automatisch dokumentieren',
  origin: 'Kundenanrufe zusammenfassen',
  icon: 'phone',
  source: 'Telefon',
  clockStart: 10 * 3600 + 30 * 60 + 12,
  next: 'revenue',
  outputTitle: 'Gesprächsnotiz im CRM',
  steps: [
    {
      title: 'Gespräch erfassen',
      description: 'Der Anruf wird aufgezeichnet und die gesprochene Sprache in Text umgewandelt.',
      phase: 'input',
      icon: 'audio',
      beats: 3,
      duration: 3600,
      activities: [
        { text: 'Eingehender Anruf · Restaurant Hafenblick', tone: 'data' },
        { text: 'Audio wurde aufgenommen.', beat: 1 },
        { text: 'Sprache wird verarbeitet.', beat: 2 },
        { text: 'Transkript erstellt', beat: 3, tone: 'success' },
      ],
    },
    {
      title: 'Gespräch verstehen',
      description: 'Die KI erkennt im freien Gesprächstext die geschäftlich relevanten Informationen.',
      phase: 'verstehen',
      icon: 'brain',
      beats: 7,
      duration: 4600,
      activities: [
        { text: 'Gesprächsinhalt wird analysiert' },
        { text: 'Kunde erkannt', beat: 1, tone: 'data' },
        { text: 'Ansprechpartner erkannt', beat: 2, tone: 'data' },
        { text: 'Liefertermin erkannt', beat: 3, tone: 'data' },
        { text: 'Wunschzeit erkannt', beat: 4, tone: 'data' },
        { text: 'Bezug auf Vorwoche erkannt', beat: 5, tone: 'data' },
        { text: 'Mengenänderung erkannt', beat: 6, tone: 'data' },
        { text: 'Zusätzliche Anfrage erkannt', beat: 7, tone: 'data' },
      ],
    },
    {
      title: 'Kundenhistorie abrufen',
      description: 'Der Agent sucht den Kunden im System und lädt die Bestellung der Vorwoche.',
      phase: 'holen',
      icon: 'database',
      beats: 3,
      duration: 3000,
      activities: [
        { text: 'Kundendaten werden abgerufen' },
        { text: 'Kunde im System gefunden · Kd.-Nr. 20117', beat: 1, tone: 'success' },
        { text: 'Letzte Bestellung gefunden: #K-10482', beat: 2, tone: 'success' },
        { text: 'Bestellpositionen geladen', beat: 3 },
      ],
    },
    {
      title: 'Gespräch zusammenfassen',
      description: 'Aus Gespräch und Kundenhistorie entsteht eine kurze, verständliche Zusammenfassung.',
      phase: 'verarbeiten',
      icon: 'note',
      beats: 2,
      duration: 3800,
      activities: [
        { text: 'Zusammenfassung wird erstellt' },
        { text: 'Zusammenfassung erstellt', beat: 2, tone: 'success' },
      ],
    },
    {
      title: 'Aufgaben erkennen',
      description: 'Der Agent leitet konkrete nächste Schritte für den Innendienst ab.',
      phase: 'verarbeiten',
      icon: 'tasks',
      beats: 5,
      duration: 3500,
      activities: [
        { text: 'Aufgaben werden abgeleitet' },
        { text: 'Wassermenge angepasst: 20 → 25 Kisten', beat: 2, tone: 'data' },
        { text: 'Kühlwagen-Anfrage an Disposition vorgemerkt', beat: 4, tone: 'warning' },
        { text: '5 Aufgaben erkannt', beat: 5, tone: 'success' },
      ],
    },
    {
      title: 'Mitarbeiter prüft',
      description: 'Der Agent bereitet vor – der Mitarbeiter behält die Kontrolle.',
      phase: 'freigabe',
      icon: 'human',
      beats: 1,
      duration: 900,
      human: {
        question: 'Stimmen Zusammenfassung und Aufgaben? Erst nach Freigabe wird die Notiz gespeichert.',
        approve: 'Gesprächsnotiz freigeben',
        edit: 'Bearbeiten',
      },
      activities: [{ text: 'Gesprächsnotiz zur Prüfung vorbereitet' }],
    },
    {
      title: 'Gesprächsnotiz erstellt',
      description: 'Die freigegebene Notiz wird gespeichert und die Aufgaben stehen zur Weiterbearbeitung bereit.',
      phase: 'ergebnis',
      icon: 'check',
      beats: 2,
      duration: 2000,
      activities: [
        { text: 'Gesprächsnotiz wird im CRM angelegt' },
        { text: '5 Aufgaben an Innendienst übergeben', beat: 1 },
        { text: 'Gesprächsnotiz gespeichert', beat: 2, tone: 'success' },
      ],
    },
  ],
  facts: [
    { label: 'Kunde', value: 'Restaurant Hafenblick', step: 1, beat: 1 },
    { label: 'Ansprechpartner', value: 'Herr Schneider', step: 1, beat: 2 },
    { label: 'Termin', value: 'Freitag', step: 1, beat: 3 },
    { label: 'Lieferzeit', value: 'vor 11:00 Uhr', step: 1, beat: 4 },
    { label: 'Referenz', value: 'Bestellung der Vorwoche', step: 1, beat: 5 },
    { label: 'Änderung', value: '+5 Kisten Wasser', step: 1, beat: 6, tone: 'warning' },
    { label: 'Zusatzanfrage', value: 'Verfügbarkeit Kühlwagen', step: 1, beat: 7, tone: 'warning' },
    { label: 'Letzte Lieferung', value: 'Bestellung #K-10482', step: 2, beat: 2 },
  ],
  recap: {
    verstehen: 'Gesprochenes Gespräch in Text umgewandelt und Kunde, Termin und Wünsche erkannt',
    suchen: 'Kundendaten und die Bestellung #K-10482 der Vorwoche gefunden',
    strukturieren: 'Freier Gesprächstext → Zusammenfassung und fünf konkrete Aufgaben',
    handeln: 'Gesprächsnotiz im CRM vorbereitet und Aufgaben an den Innendienst übergeben',
    pruefen: 'Mitarbeiter hat geprüft und freigegeben – die Kühlwagen-Frage bleibt beim Menschen',
  },
  Workspace,
  Output,
}
