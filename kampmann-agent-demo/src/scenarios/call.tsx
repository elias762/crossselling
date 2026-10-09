import { useEffect } from 'react'
import { Check, CheckSquare, ClipboardCheck, Database, History, NotebookPen, Phone, Square, TriangleAlert } from 'lucide-react'
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
  { name: 'Mineralwasser 12 × 0,7 l Glas', qty: 20, unit: 'Kisten', water: true },
  { name: 'Apfelschorle 24 × 0,33 l', qty: 6, unit: 'Kisten' },
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
  const typed = useTween(p.reached(0), p.stepMs(0) * 0.85, p.reached(1))
  if (!p.reached(0)) return <Placeholder>Transkript erscheint, sobald das Gespräch verarbeitet wird.</Placeholder>
  return <MarkedText segs={TRANSCRIPT} p={p} typed={typed} className="text-[1.05rem] leading-[2.4] text-slate-700" />
}

function Workspace({ p }: ScenarioProps) {
  const summary = summaryStore.use()
  useEffect(() => summaryStore.reset(), [])
  const live = p.active(0) && p.status === 'running'
  const waterChanged = p.reached(3, 3)

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 xl:col-span-5">
        <Panel anchor={0} title="Eingang · Telefon" icon={<Phone className="size-4" />} aside={<Badge tone={live ? 'brand' : 'neutral'}>{live ? 'wird verarbeitet' : p.reached(0) ? 'Anruf beendet' : 'eingehend'}</Badge>}>
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
        {/* 3 · Informationen holen */}
        {p.reached(2) ? (
          <Reveal show>
            <Panel anchor={2} title="Kundenhistorie" icon={<History className="size-4" />} aside={<SystemChip label="Kundendaten" state={chipState(p, 2, 1)} icon={<Database className="size-3.5" />} />}>
              {p.reached(2, 1) ? (
                <Reveal show>
                  <div className="mb-2 flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-slate-800">Letzte Lieferung: Bestellung #K-10482</span>
                    <span className="text-slate-500">Freitag letzter Woche</span>
                  </div>
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-[0.95rem]">
                    {ORDER.map((o) => {
                      const changed = o.water && waterChanged
                      return (
                        <li key={o.name} className={cx('flex items-center justify-between px-3 py-2 transition-colors duration-500', changed && 'bg-amber-50')}>
                          <span className="text-slate-700">{o.name}</span>
                          <span className="tabular flex items-center gap-2 text-slate-600">
                            {changed ? (
                              <>
                                <span className="text-slate-400 line-through">{o.qty}</span>
                                <span className="font-semibold text-slate-900">
                                  {o.qty + 5} {o.unit}
                                </span>
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
                </Reveal>
              ) : (
                <div className="text-sm text-slate-400">Kunde wird im System gesucht …</div>
              )}
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Kundenhistorie · wird abgerufen, sobald der Kunde erkannt ist</Placeholder>
        )}

        {/* 4 · Verarbeiten */}
        {p.reached(3) ? (
          <Reveal show>
            <Panel
              anchor={3}
              title="Entwurf Gesprächsnotiz"
              icon={<NotebookPen className="size-4" />}
              aside={p.editing ? <Badge tone="human">wird bearbeitet</Badge> : summary !== SUMMARY ? <Badge tone="human">vom Mitarbeiter angepasst</Badge> : undefined}
            >
              {p.editing ? (
                <textarea
                  autoFocus
                  value={summary}
                  onChange={(e) => summaryStore.set(e.target.value)}
                  className="h-32 w-full resize-none rounded-lg border border-human-200 bg-human-50/40 p-3 text-[1rem] leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-human-200"
                />
              ) : (
                <p className="text-[1rem] leading-relaxed text-slate-800">
                  <Typewriter text={summary} show active={p.active(3) && !p.reached(3, 2)} ms={p.stepMs(3) * 0.3} />
                </p>
              )}
              {p.reached(3, 2) && (
                <div className="mt-4">
                  <Label>Aufgaben</Label>
                  <ul className="space-y-1.5">
                    {TASKS.map((t, i) => (
                      <Reveal key={t} show={p.reached(3, i + 2)}>
                        <li className="flex items-center gap-2.5 text-[0.98rem] text-slate-800">
                          {p.finished ? <CheckSquare className="size-4.5 text-emerald-600" /> : <Square className="size-4.5 text-slate-400" />}
                          {t}
                          {i === 3 && p.reached(4, 2) && <Badge tone="warn">Rückfrage Disposition</Badge>}
                        </li>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              )}
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Gesprächsnotiz · Zusammenfassung und Aufgaben entstehen aus Gespräch und Historie</Placeholder>
        )}

        {/* 5 · Prüfen */}
        {p.reached(4) ? (
          <Reveal show>
            <Panel anchor={4} title="Prüfung durch den Agenten" icon={<ClipboardCheck className="size-4" />}>
              <div className="space-y-2 text-[0.95rem]">
                <Reveal show={p.reached(4, 1)}>
                  <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">
                    <Check className="size-4.5 shrink-0" /> Mengenänderung plausibel: 20 → 25 Kisten Wasser
                  </div>
                </Reveal>
                <Reveal show={p.reached(4, 2)}>
                  <div className="flex items-center gap-3 rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
                    <TriangleAlert className="size-4.5 shrink-0" /> Kühlwagen: Zusage kann nur die Disposition geben – als Rückfrage markiert
                  </div>
                </Reveal>
              </div>
            </Panel>
          </Reveal>
        ) : (
          <Placeholder>Prüfung · der Agent kontrolliert sein eigenes Ergebnis</Placeholder>
        )}
      </div>
    </div>
  )
}

function Output({ p }: ScenarioProps) {
  const summary = summaryStore.use()
  const released = p.reached(6, 1)
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
        <div className="ml-auto">{released ? <Badge tone="ok">Zur Weiterbearbeitung freigegeben</Badge> : <Badge tone="brand">wird gespeichert …</Badge>}</div>
      </div>
      <div className="grid gap-6 px-6 py-5 md:grid-cols-[minmax(0,14rem)_1fr]">
        <dl className="space-y-3 text-sm">
          {[
            ['Datum', 'Heute, 10:34 Uhr'],
            ['Ansprechpartner', 'Herr Schneider'],
            ['Kanal', 'Telefon · 03:42 Min.'],
            ['Referenz', 'Bestellung #K-10482'],
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
  context:
    'Gastronomen rufen an, um Bestellungen aufzugeben oder zu ändern. Heute notiert der Innendienst das Gespräch von Hand und überträgt Wünsche und Aufgaben anschließend ins System.',
  icon: 'phone',
  source: 'Telefon',
  clockStart: 10 * 3600 + 30 * 60 + 12,
  next: 'revenue',
  outputTitle: 'Gesprächsnotiz im CRM',
  steps: [
    {
      title: 'Gespräch erfassen',
      description: 'Der Anruf wird aufgezeichnet und in Text umgewandelt.',
      insight: 'Aus gesprochener Sprache wird Text – die Grundlage für alle weiteren Schritte.',
      phase: 'input',
      icon: 'audio',
      beats: 2,
      duration: 4000,
      activities: [
        { text: 'Eingehender Anruf · Restaurant Hafenblick', tone: 'data' },
        { text: 'Sprache wird in Text umgewandelt', beat: 1 },
        { text: 'Transkript erstellt', beat: 2, tone: 'success' },
      ],
    },
    {
      title: 'Gespräch verstehen',
      description: 'Die KI markiert im Text, was geschäftlich wichtig ist.',
      insight: 'Die KI erkennt im freien Gespräch, was relevant ist – ganz ohne Formular oder feste Vorgaben.',
      phase: 'verstehen',
      icon: 'brain',
      beats: 7,
      duration: 6300,
      activities: [
        { text: 'Gespräch wird analysiert' },
        { text: '7 Informationen erkannt', beat: 7, tone: 'success' },
      ],
    },
    {
      title: 'Kundenhistorie abrufen',
      description: 'Der Agent schaut im System nach der Bestellung der Vorwoche.',
      insight: 'Der Agent verbindet das Gespräch mit Unternehmensdaten – wie ein Kollege, der kurz ins System schaut.',
      phase: 'holen',
      icon: 'database',
      beats: 1,
      duration: 2600,
      activities: [
        { text: 'Kundendaten werden abgerufen' },
        { text: 'Letzte Bestellung #K-10482 gefunden', beat: 1, tone: 'success' },
      ],
    },
    {
      title: 'Notiz & Aufgaben erstellen',
      description: 'Aus Gespräch und Historie entstehen eine Zusammenfassung und konkrete To-dos.',
      insight: 'Aus einem unstrukturierten Gespräch werden eine klare Zusammenfassung und fünf konkrete Aufgaben.',
      phase: 'verarbeiten',
      icon: 'note',
      beats: 6,
      duration: 6000,
      activities: [
        { text: 'Zusammenfassung wird geschrieben' },
        { text: 'Aufgaben werden abgeleitet', beat: 2 },
        { text: 'Entwurf der Gesprächsnotiz fertig', beat: 6, tone: 'success' },
      ],
    },
    {
      title: 'Ergebnis prüfen',
      description: 'Der Agent kontrolliert seinen Entwurf und markiert, was er nicht selbst entscheiden kann.',
      insight: 'Der Agent kennt seine Grenzen: Was er nicht sicher entscheiden kann, markiert er für den Menschen.',
      phase: 'pruefen',
      icon: 'clipboard',
      beats: 2,
      duration: 3200,
      activities: [
        { text: 'Mengenänderung plausibel', beat: 1, tone: 'success' },
        { text: 'Kühlwagen-Anfrage → Rückfrage an Disposition', beat: 2, tone: 'warning' },
      ],
    },
    {
      title: 'Mitarbeiter prüft',
      description: 'Der Agent bereitet vor – der Mitarbeiter behält die Kontrolle.',
      phase: 'freigabe',
      icon: 'human',
      duration: 900,
      human: {
        question: 'Stimmen Zusammenfassung und Aufgaben? Erst nach Freigabe wird die Notiz gespeichert.',
        approve: 'Gesprächsnotiz freigeben',
        edit: 'Bearbeiten',
      },
      activities: [],
    },
    {
      title: 'Gesprächsnotiz speichern',
      description: 'Die freigegebene Notiz landet im CRM, die Aufgaben beim Innendienst.',
      phase: 'ergebnis',
      icon: 'check',
      duration: 2000,
      activities: [{ text: 'Gesprächsnotiz im CRM gespeichert', beat: 1, tone: 'success' }],
    },
  ],
  facts: [
    { label: 'Kunde', value: 'Restaurant Hafenblick', step: 1, beat: 1 },
    { label: 'Ansprechpartner', value: 'Herr Schneider', step: 1, beat: 2 },
    { label: 'Termin', value: 'Freitag', step: 1, beat: 3 },
    { label: 'Lieferzeit', value: 'vor 11:00 Uhr', step: 1, beat: 4 },
    { label: 'Referenz', value: 'Bestellung der Vorwoche', step: 1, beat: 5 },
    { label: 'Änderung', value: '+5 Kisten Wasser', step: 1, beat: 6, tone: 'warning' },
    { label: 'Zusatzanfrage', value: 'Kühlwagen am Wochenende', step: 1, beat: 7, tone: 'warning' },
  ],
  recap: {
    verstehen: 'Gesprochenes Gespräch in Text umgewandelt und Kunde, Termin und Wünsche erkannt',
    suchen: 'Kundendaten und die Bestellung #K-10482 der Vorwoche gefunden',
    strukturieren: 'Freier Gesprächstext → Zusammenfassung und fünf konkrete Aufgaben',
    handeln: 'Gesprächsnotiz im CRM vorbereitet und Aufgaben an den Innendienst übergeben',
    pruefen: 'Kühlwagen-Frage als Rückfrage markiert, Mitarbeiter hat geprüft und freigegeben',
  },
  Workspace,
  Output,
}
