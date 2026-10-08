/**
 * Weitere Use Cases aus den Fachbereichen – bewusst schlank gehalten:
 * je Idee ein Satz pro Phase und ein kleines Beispiel-Ergebnis (fiktive Zahlen).
 */

export type IdeaType = 'report' | 'control' | 'action' | 'document'
export type GroupId = 'logistik' | 'auftrag' | 'einkauf' | 'buchhaltung' | 'vertrieb'

export type IdeaResult =
  | { kind: 'table'; columns: string[]; rows: { cells: string[]; warn?: boolean }[] }
  | { kind: 'kpis'; items: { label: string; value: string; warn?: boolean }[] }

/** Ein Satz je Phase: Input, Verstehen, Infos holen, Verarbeiten, Prüfen, Freigabe, Ergebnis */
export type SevenSteps = [string, string, string, string, string, string, string]

export interface Idea {
  id: string
  group: GroupId
  type: IdeaType
  title: string
  /** Was die KI macht – ein Satz */
  short: string
  /** Originalwortlaut aus dem Unternehmen */
  origin: string
  /** Bereits als Live-Demo umgesetzt → ID des Szenarios */
  related?: string
  steps?: SevenSteps
  result?: IdeaResult
  resultTitle?: string
  note?: string
}

export const TYPES: Record<IdeaType, { label: string; hint: string }> = {
  report: { label: 'Auswertung', hint: 'Daten zusammenführen und als Bericht aufbereiten' },
  control: { label: 'Kontrolle', hint: 'Automatisch prüfen und Auffälligkeiten melden' },
  action: { label: 'Automatisierung', hint: 'Arbeitsschritte vorbereiten oder ausführen' },
  document: { label: 'Dokumente', hint: 'Rechnungen, Schreiben und Mails verstehen' },
}

export const GROUPS: { id: GroupId; label: string }[] = [
  { id: 'logistik', label: 'Logistik & Fuhrpark' },
  { id: 'auftrag', label: 'Auftragseingang & Bestand' },
  { id: 'einkauf', label: 'Einkauf, Preise & Stammdaten' },
  { id: 'buchhaltung', label: 'Buchhaltung & DMS' },
  { id: 'vertrieb', label: 'Vertrieb & Statistik' },
]

export const IDEAS: Idea[] = [
  /* ---------------------------- Logistik & Fuhrpark ---------------------------- */
  {
    id: 'auslieferung',
    group: 'logistik',
    type: 'report',
    title: 'Auslieferung je Tour & Monat',
    short: 'Fässer, Kisten und Hektoliter je Tour zählen – inklusive Umrechnung von HL in kg.',
    origin: 'Aufstellung der Auslieferung von Fass / Kiste / HL pro Monat / pro Tour, dabei Umrechnung der HL in kg nach vorgegebenem Umrechnungsschlüssel',
    steps: [
      'Lieferscheine und Tourdaten des Monats',
      'Gebinde erkennen: Fass, Kiste, Hektoliter',
      'Umrechnungsschlüssel HL → kg laden',
      'Je Tour summieren und in kg umrechnen',
      'Ausreißer markieren, z. B. Tour ohne Lieferschein',
      'Disposition prüft die Monatsübersicht',
      'Monatsbericht je Tour als Excel',
    ],
    resultTitle: 'Auslieferung September',
    result: {
      kind: 'table',
      columns: ['Tour', 'Fässer', 'Kisten', 'HL', 'kg'],
      rows: [
        { cells: ['Tour 1 · Essen-Nord', '142', '1.280', '186,4', '24.232'] },
        { cells: ['Tour 2 · Rüttenscheid', '96', '1.045', '142,7', '18.551'] },
        { cells: ['Tour 3 · Mülheim', '118', '870', '131,9', '17.147'] },
      ],
    },
    note: 'Umrechnungsschlüssel im Beispiel: 1 HL = 130 kg inkl. Gebinde',
  },
  {
    id: 'absatz-bestand',
    group: 'logistik',
    type: 'report',
    title: 'Absatz zu Lagerbestand je Artikel',
    short: 'Monatlicher Absatz neben dem Bestand – wie lange reicht die Ware?',
    origin: 'Aufstellung monatlicher Absatz zu Lagerbestand pro Artikel',
    steps: [
      'Absatzzahlen und Lagerbestände',
      'Artikel über beide Listen zuordnen',
      'Monatsabsatz der letzten 12 Monate laden',
      'Reichweite in Wochen berechnen',
      'Engpässe und Ladenhüter markieren',
      'Einkauf bewertet die Auffälligkeiten',
      'Übersicht Absatz zu Bestand',
    ],
    resultTitle: 'Reichweite je Artikel',
    result: {
      kind: 'table',
      columns: ['Artikel', 'Absatz / Monat', 'Bestand', 'Reichweite'],
      rows: [
        { cells: ['Mineralwasser 12 × 0,7 l', '2.400 Ki', '1.150 Ki', '2,1 Wochen – knapp'], warn: true },
        { cells: ['Pils 50 l KEG', '310 Fass', '280 Fass', '3,9 Wochen'] },
        { cells: ['Glühwein 6 × 1,0 l', '12 Ki', '640 Ki', '231 Wochen – Ladenhüter'], warn: true },
      ],
    },
  },
  {
    id: 'kosten-lkw',
    group: 'logistik',
    type: 'report',
    title: 'Kosten je LKW & Kostenstelle',
    short: 'Diesel, Werkstatt, Maut und Leasing automatisch je Fahrzeug zusammengeführt.',
    origin: 'Aufstellung der Kosten pro LKW / Kostenstelle',
    steps: [
      'Rechnungen: Diesel, Werkstatt, Maut, Leasing',
      'Fahrzeug und Kostenart erkennen',
      'Kostenstellen der Fahrzeuge laden',
      'Kosten je LKW und Monat summieren',
      'Ungewöhnliche Kostensprünge markieren',
      'Fuhrparkleitung prüft',
      'Kostenübersicht je LKW',
    ],
    resultTitle: 'Kosten September',
    result: {
      kind: 'table',
      columns: ['LKW', 'Diesel', 'Werkstatt', 'Sonstiges', 'Gesamt'],
      rows: [
        { cells: ['LKW 01 · KST 4101', '3.840 €', '420 €', '1.650 €', '5.910 €'] },
        { cells: ['LKW 02 · KST 4102', '3.520 €', '2.980 €', '1.650 €', '8.150 €'], warn: true },
        { cells: ['LKW 03 · KST 4103', '2.910 €', '180 €', '1.650 €', '4.740 €'] },
      ],
    },
  },
  {
    id: 'laufleistung',
    group: 'logistik',
    type: 'report',
    title: 'Laufleistung & Verbrauch je LKW',
    short: 'UTA-Tankabrechnung und Kilometerstände aus dem MDE-Gerät zu l/100 km verrechnet.',
    origin: 'Aufstellung der Laufleistung LKW pro Monat / Jahr (UTA-Abrechnung, Eingabe MDE-Gerät), Verbrauch/100 km',
    steps: [
      'UTA-Abrechnung + km-Stände aus dem MDE',
      'Tankvorgänge den Fahrzeugen zuordnen',
      'Kilometerstände je Monat laden',
      'Laufleistung und l/100 km berechnen',
      'Unplausible Werte markieren (z. B. Tippfehler beim km-Stand)',
      'Fuhrparkleitung prüft',
      'Monats- und Jahresübersicht',
    ],
    resultTitle: 'Verbrauch September',
    result: {
      kind: 'table',
      columns: ['LKW', 'km', 'Diesel', 'l / 100 km'],
      rows: [
        { cells: ['LKW 01', '4.820', '1.205 l', '25,0'] },
        { cells: ['LKW 02', '3.960', '1.108 l', '28,0'] },
        { cells: ['LKW 03', '410', '980 l', '239,0 – km-Stand prüfen'], warn: true },
      ],
    },
  },
  {
    id: 'personalkosten',
    group: 'logistik',
    type: 'report',
    title: 'Personalkosten Logistik',
    short: 'Personalkosten der Logistik je Bereich und Monat – aggregiert, ohne Einzelpersonen.',
    origin: 'Aufstellung der Personalkosten MA Logistik',
    steps: [
      'Lohnjournal des Monats',
      'Mitarbeitende der Logistik erkennen',
      'Zuordnung Fahrer, Lager, Disposition laden',
      'Kosten je Bereich summieren',
      'Veränderung zum Vormonat zeigen',
      'Logistikleitung prüft',
      'Monatsübersicht Personalkosten',
    ],
    resultTitle: 'Personalkosten September',
    result: {
      kind: 'kpis',
      items: [
        { label: 'Fahrer', value: '48.200 €' },
        { label: 'Lager', value: '31.600 €' },
        { label: 'Disposition', value: '9.400 €' },
        { label: 'Gesamt · +3,1 % ggü. Vormonat', value: '89.200 €', warn: true },
      ],
    },
  },
  {
    id: 'ueberstunden',
    group: 'logistik',
    type: 'report',
    title: 'Überstunden Logistik',
    short: 'Überstunden aus der Zeiterfassung automatisch je Team ausgewertet.',
    origin: 'Aufstellung Überstunden MA Logistik',
    steps: [
      'Zeiterfassung des Monats',
      'Soll- und Ist-Stunden je Team erkennen',
      'Arbeitszeitmodelle laden',
      'Überstunden je Team berechnen',
      'Grenzwerte prüfen (z. B. mehr als 100 h je Team)',
      'Teamleitung prüft',
      'Übersicht Überstunden',
    ],
    resultTitle: 'Überstunden September',
    result: {
      kind: 'table',
      columns: ['Team', 'Soll', 'Ist', 'Überstunden'],
      rows: [
        { cells: ['Fahrer', '1.680 h', '1.812 h', '+132 h'], warn: true },
        { cells: ['Lager', '1.200 h', '1.236 h', '+36 h'] },
        { cells: ['Disposition', '480 h', '478 h', '−2 h'] },
      ],
    },
  },
  {
    id: 'tour-wirtschaftlichkeit',
    group: 'logistik',
    type: 'report',
    title: 'Umsatz je Tour zu Kosten',
    short: 'Umsatz je Tour gegen LKW- und Personalkosten – monatlich und kumuliert.',
    origin: 'Aufstellung monatlich und kumuliert: Umsatz pro Tour zu Kosten LKW und Personal',
    steps: [
      'Umsätze, LKW-Kosten, Personalkosten',
      'Alles über die Tour verknüpfen',
      'Zahlen aus den Auswertungen oben übernehmen',
      'Monatlich und kumuliert gegenüberstellen',
      'Touren mit hoher Kostenquote markieren',
      'Geschäftsführung bewertet',
      'Tour-Übersicht monatlich & kumuliert',
    ],
    resultTitle: 'Touren September',
    result: {
      kind: 'table',
      columns: ['Tour', 'Umsatz', 'Kosten LKW + Personal', 'Kostenquote'],
      rows: [
        { cells: ['Tour 1', '84.300 €', '9.850 €', '11,7 %'] },
        { cells: ['Tour 2', '61.200 €', '10.400 €', '17,0 %'] },
        { cells: ['Tour 3', '38.900 €', '9.700 €', '24,9 %'], warn: true },
      ],
    },
    note: 'Baut auf den Auswertungen zu LKW-Kosten und Personalkosten auf.',
  },

  /* ------------------------ Auftragseingang & Bestand ------------------------ */
  {
    id: 'gastivo-kontrolle',
    group: 'auftrag',
    type: 'control',
    title: 'Gastivo-Bestellung prüfen',
    short: 'Jede Gastivo-Bestellung automatisch auf Logistik und Dieselpauschale prüfen.',
    origin: 'Bei Bestelleingang via Gastivo – automatisierte Kontrolle bzgl. Logistik und Dieselpauschale',
    steps: [
      'Neue Bestellung über Gastivo',
      'Kunde, Positionen und Wunschtermin erkennen',
      'Tourplan und Konditionen des Kunden laden',
      'Liefertag und Dieselpauschale ermitteln',
      'Mindestwert unterschritten? Pauschale fehlt?',
      'Innendienst entscheidet bei Abweichung',
      'Bestellung geprüft übernommen',
    ],
    resultTitle: 'Prüfung Bestellung Hotel Lindenhof',
    result: {
      kind: 'table',
      columns: ['Prüfung', 'Ergebnis'],
      rows: [
        { cells: ['Liefertag passt zur Tour', 'Donnerstag · Tour 2'] },
        { cells: ['Mindestbestellwert', '412 € (min. 250 €)'] },
        { cells: ['Dieselpauschale', 'fehlt – 9,50 € ergänzen?'], warn: true },
      ],
    },
  },
  {
    id: 'mail-bestellung',
    group: 'auftrag',
    type: 'action',
    title: 'Bestellung per Mail → Drinks',
    short: 'Bestellmail lesen, Auftrag in Drinks einspielen und Bestätigung an den Kunden schreiben.',
    origin: 'Automatisierte Antwort bei Bestelleingängen per Mail und gleichzeitig Einspielen in Drinks',
    steps: [
      'Bestellung per E-Mail',
      'Artikel und Mengen aus dem Text lesen',
      'Passende Artikel in Drinks finden',
      'Auftrag anlegen und Antwort entwerfen',
      'Unklare Positionen markieren',
      'Innendienst gibt Auftrag und Antwort frei',
      'Auftrag in Drinks + Bestätigung an den Kunden',
    ],
    resultTitle: 'Auftrag aus der Mail',
    result: {
      kind: 'table',
      columns: ['In der Mail', 'Artikel in Drinks', 'Menge'],
      rows: [
        { cells: ['„2 Kisten Cola“', '60318 Cola 24 × 0,33 l', '2 Ki'] },
        { cells: ['„Wasser wie immer“', '30112 Mineralwasser 12 × 0,7 l', '10 Ki'] },
        { cells: ['„das neue Radler“', '2 mögliche Treffer – Rückfrage', '–'], warn: true },
      ],
    },
  },
  {
    id: 'rueckladung',
    group: 'auftrag',
    type: 'control',
    title: 'Rückladung trotz Bestand',
    short: 'Rückladungen mit dem Lagerbestand abgleichen und Klärungsfälle aufzeigen.',
    origin: 'Bestandsüberprüfung bei Rückladungen trotz Bestand',
    steps: [
      'Rückladeliste der Tour',
      'Artikel und Mengen erkennen',
      'Lagerbestand zum Ladezeitpunkt laden',
      'Rückladung und Bestand gegenüberstellen',
      'Fälle „Rückladung trotz Bestand“ markieren',
      'Lagerleitung klärt die Ursache',
      'Liste der Klärungsfälle',
    ],
    resultTitle: 'Rückladungen Tour 2',
    result: {
      kind: 'table',
      columns: ['Artikel', 'Rückladung', 'Bestand', 'Hinweis'],
      rows: [
        { cells: ['Apfelschorle 24 × 0,33 l', '6 Ki', '420 Ki', 'trotz Bestand – klären'], warn: true },
        { cells: ['Pils 50 l KEG', '2 Fass', '0 Fass', 'erklärbar'] },
      ],
    },
  },
  {
    id: 'mindestbestand',
    group: 'auftrag',
    type: 'action',
    title: 'Nachbestellung bei Mindestbestand',
    short: 'Mindestbestand unterschritten → fertiger Bestellvorschlag an die Industrie.',
    origin: 'Automatisierte Bestellung an Industrie bei Unterschreitung der Mindestbestände',
    steps: [
      'Täglicher Lagerbestand',
      'Mindestbestände je Artikel kennen',
      'Absatz und Lieferzeiten laden',
      'Bestellmenge berechnen',
      'Palettenmengen und Aktionen beachten',
      'Einkauf gibt die Bestellung frei',
      'Bestellung an die Industrie',
    ],
    resultTitle: 'Bestellvorschlag heute',
    result: {
      kind: 'table',
      columns: ['Artikel', 'Bestand', 'Mindestbestand', 'Vorschlag'],
      rows: [
        { cells: ['Mineralwasser 12 × 0,7 l', '380 Ki', '500 Ki', '320 Ki (8 Paletten)'] },
        { cells: ['Cola 24 × 0,33 l', '95 Ki', '120 Ki', '120 Ki (3 Paletten)'] },
      ],
    },
  },

  /* ---------------------- Einkauf, Preise & Stammdaten ---------------------- */
  {
    id: 'neuanlage-preisgruppen',
    group: 'einkauf',
    type: 'action',
    title: 'Artikelneuanlage: alle Preisgruppen',
    short: 'Neuer Artikel → Verkaufspreise aller Preisgruppen aus der Kalkulationsdatei.',
    origin: 'Bei Artikelneuanlage automatisierte Umrechnung aller Preisgruppen – Verknüpfung mit der Kalkulationsdatei',
    steps: [
      'Neuer Artikel mit Einkaufspreis 18,40 €',
      'Warengruppe und Gebinde erkennen',
      'Aufschläge aus der Kalkulationsdatei laden',
      'Verkaufspreis je Preisgruppe berechnen',
      'Mindestmarge und Rundung prüfen',
      'Einkauf gibt die Preise frei',
      'Preise im System hinterlegt',
    ],
    resultTitle: 'Preisgruppen für den neuen Artikel',
    result: {
      kind: 'table',
      columns: ['Preisgruppe', 'Aufschlag', 'Verkaufspreis'],
      rows: [
        { cells: ['PG 1 · Gastronomie', '+32 %', '24,29 €'] },
        { cells: ['PG 2 · Großkunde', '+24 %', '22,82 €'] },
        { cells: ['PG 3 · Handel', '+18 %', '21,71 €'] },
        { cells: ['PG 4 · Aktion', '+9 %', '20,06 € – unter Mindestmarge'], warn: true },
      ],
    },
  },
  {
    id: 'preiserhoehung-excel',
    group: 'einkauf',
    type: 'action',
    related: 'kovit',
    title: 'Preiserhöhungen per Excel einspielen',
    short: 'Excel-Datei mit Preiserhöhungen einlesen und die Werte automatisch übernehmen.',
    origin: 'Preiserhöhungen: die Lieferantenpreise werden von der KI erfasst → über eine Schnittstelle z. B. die Excel-Datei mit den Preiserhöhungen reinziehen',
  },
  {
    id: 'preiserhoehung-schreiben',
    group: 'einkauf',
    type: 'document',
    related: 'price',
    title: 'Preiserhöhungsschreiben auswerten',
    short: 'Welche Artikel erhöhen sich um wie viel €? – auch bei endlos langen Listen wie von Coca-Cola.',
    origin: 'Die KI wertet die Preiserhöhungsschreiben der Industrie aus & kann sagen, welche Artikel im System sich um wie viel € erhöhen (gerade bei Coca-Cola hilfreich, wo es eine endlos lange Excel-Liste gibt)',
  },
  {
    id: 'fehlende-preise',
    group: 'einkauf',
    type: 'control',
    related: 'quality',
    title: 'Übersicht fehlende Preise',
    short: 'Übersicht, bei welchen Artikeln Preise fehlen.',
    origin: 'Preise: die KI kann eine Übersicht erstellen, bei welchen Artikeln Preise fehlen',
  },
  {
    id: 'freitagsmail',
    group: 'einkauf',
    type: 'action',
    title: 'Freitags-Mail: Artikelneuanlagen',
    short: 'Die Wochenübersicht der Neuanlagen als fertige Mail – der Mensch schickt sie ab.',
    origin: 'Jeden Freitag wird die Mail an Team Kampmann mit den Artikelneuanlagen von der KI erfasst und durch den Menschen verschickt',
    steps: [
      'Freitag: Wochenrückblick startet',
      'Neuanlagen der Woche erkennen',
      'Artikeldaten und Preise laden',
      'Mail an Team Kampmann formulieren',
      'Vollständigkeit prüfen (Preis, EAN, Bild)',
      'Mitarbeiter liest gegen und verschickt',
      'Mail an Team Kampmann',
    ],
    resultTitle: 'Neuanlagen dieser Woche',
    result: {
      kind: 'table',
      columns: ['Neuanlage', 'Preis', 'Status'],
      rows: [
        { cells: ['Holunder-Schorle 24 × 0,33 l', '✓', 'vollständig'] },
        { cells: ['Craft IPA 20 × 0,33 l', '✓', 'vollständig'] },
        { cells: ['Hafer-Drink 12 × 1,0 l', 'fehlt', 'Preis ergänzen'], warn: true },
      ],
    },
  },

  /* ---------------------------- Buchhaltung & DMS ---------------------------- */
  {
    id: 'dms-kontierung',
    group: 'buchhaltung',
    type: 'document',
    title: 'Rechnungen kontieren & Wareneingang vorschlagen',
    short: 'Kontierung und passender Wareneingang werden vorgeschlagen – der Mensch prüft und gibt an die Reko.',
    origin:
      'DMS: das Kontieren der Rechnungen wird von der KI übernommen & es werden bereits Wareneingänge vorgeschlagen, welche passen könnten (sowohl im, als auch außerhalb des Lieferanten). Durch den Menschen wird dies jedoch noch einmal kurz geprüft und an die Reko übermittelt.',
    steps: [
      'Eingangsrechnung im DMS',
      'Lieferant, Beträge und Positionen lesen',
      'Offene Wareneingänge suchen – auch bei anderen Lieferanten',
      'Kontierung vorschlagen',
      'Beträge mit dem Wareneingang abgleichen',
      'Buchhaltung prüft kurz und übermittelt an die Reko',
      'Rechnung kontiert und zugeordnet',
    ],
    resultTitle: 'Vorschlag für Rechnung 2026-4471',
    result: {
      kind: 'table',
      columns: ['Feld', 'Vorschlag', 'Sicherheit'],
      rows: [
        { cells: ['Sachkonto', '5400 · Wareneingang Getränke', 'hoch'] },
        { cells: ['Kostenstelle', '1000 · Einkauf', 'hoch'] },
        { cells: ['Wareneingang', 'WE-88214 · Brauhaus Lindner', '94 %'] },
        { cells: ['Alternative', 'WE-88197 · anderer Lieferant', '41 %'], warn: true },
      ],
    },
  },
  {
    id: 'rechnungsordner',
    group: 'buchhaltung',
    type: 'document',
    title: 'Rechnungsordner → DMS',
    short: 'Rechnungen aus dem Eingangsordner erkennen, auslesen und selbst ins DMS importieren.',
    origin: 'Rechnungseingangsordner: Rechnungen selber ins DMS importieren',
    steps: [
      'Neue PDFs im Rechnungseingangsordner',
      'Rechnung, Lieferschein oder Werbung unterscheiden',
      'Lieferant im Stamm finden',
      'Rechnungsnummer, Datum und Betrag auslesen',
      'Dubletten erkennen',
      'Nur Unklares landet beim Menschen',
      'Rechnungen im DMS',
    ],
    resultTitle: 'Import heute',
    result: {
      kind: 'kpis',
      items: [
        { label: 'Dateien im Ordner', value: '46' },
        { label: 'ins DMS importiert', value: '41' },
        { label: 'keine Rechnung', value: '3' },
        { label: 'mögliche Dubletten', value: '2', warn: true },
      ],
    },
  },

  /* --------------------------- Vertrieb & Statistik --------------------------- */
  {
    id: 'statistiken',
    group: 'vertrieb',
    type: 'report',
    title: 'Wiederkehrende Statistiken',
    short: 'Die immer gleichen Statistiken für Kunden und Hersteller automatisch erstellen.',
    origin: 'Statistiken sowohl Kunde als auch Hersteller, die immer wiederkehrend sind',
    steps: [
      'Monatsende: Statistiken sind fällig',
      'Welche Statistik für wen? (Vorlagen)',
      'Absatzdaten je Kunde und Hersteller laden',
      'Statistik im gewohnten Format erstellen',
      'Plausibilität gegenüber Vormonat prüfen',
      'Vertrieb gibt den Versand frei',
      'Statistiken an Kunden und Hersteller',
    ],
    resultTitle: 'Statistiken September',
    result: {
      kind: 'table',
      columns: ['Statistik', 'Empfänger', 'Status'],
      rows: [
        { cells: ['Monatsabsatz Gastronomie', '38 Kunden', 'erstellt'] },
        { cells: ['Herstellerreport Brauerei', '6 Hersteller', 'erstellt'] },
        { cells: ['Aktionsauswertung Q3', 'Vertrieb intern', '−40 % ggü. Vormonat – prüfen'], warn: true },
      ],
    },
  },
  {
    id: 'rv-abgleich',
    group: 'vertrieb',
    type: 'control',
    title: 'RV-Abgleich Statistik ↔ Infolauf',
    short: 'Statistik und Infolauf abgleichen – Kunden finden, bei denen keine RV gepflegt ist.',
    origin: 'RV-Abgleich zwischen Statistik und Infolauf hinsichtlich Kunden, die keine RV gepflegt haben',
    steps: [
      'Statistik und Infolauf',
      'Kunden in beiden Listen zuordnen',
      'Gepflegte RV je Kunde laden',
      'Abgleich: Absatz vorhanden, RV fehlt?',
      'Neukunden und Sonderfälle unterscheiden',
      'Vertrieb pflegt fehlende RV nach',
      'Liste: Kunden ohne RV',
    ],
    resultTitle: 'Abgleich Q3',
    result: {
      kind: 'table',
      columns: ['Kunde', 'Absatz Q3', 'RV gepflegt'],
      rows: [
        { cells: ['Restaurant Hafenblick', '12.480 €', '✓'] },
        { cells: ['Hotel Lindenhof', '8.920 €', 'fehlt'], warn: true },
        { cells: ['Café Kranz', '3.150 €', 'fehlt'], warn: true },
      ],
    },
  },
]
