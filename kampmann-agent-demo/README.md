# Kampmann AI Agent – Workshop-Demonstrator

Interaktive Web-Demo für den KI-Workshop: Sie zeigt Schritt für Schritt, wie ein KI-Agent einen Geschäftsprozess bearbeitet. Grundlage sind sechs Themen, die aus dem Unternehmen selbst kamen.

> **Nur Demonstrator:** Alle Daten sind fiktiv. Es gibt keine echten Schnittstellen und keine Kundendaten.

## Schnellstart

| Weg | Wann | Wie |
|---|---|---|
| **Offline-Datei** | Workshop-Laptop, Beamer, unsicheres WLAN | `offline/Kampmann-AI-Agent-Demo.html` per Doppelklick in Chrome/Edge öffnen. Läuft komplett ohne Internet. |
| Entwicklungsserver | Anpassungen | `npm install` und dann `npm run dev` |
| Web-Deployment | Link teilen | `npm run build` erzeugt `dist/`. Bei Vercel ein eigenes Projekt mit Root Directory `kampmann-agent-demo` anlegen. |

Nach Änderungen die Offline-Datei mit `npm run build:single` neu erzeugen.

## Aufbau

Alle sechs Use Cases nutzen **dieselbe Agentenoberfläche**. Es wechselt nur das Szenario. Jeder Case hat **genau sieben Schritte, einen pro Phase**, sodass die Schrittleiste in allen Beispielen gleich aufgebaut ist:

**Input → Verstehen → Informationen holen → Verarbeiten → Prüfen → Menschliche Freigabe → Ergebnis**

Jeder Live-Case zeigt vor dem Start (und jederzeit über „ⓘ Worum geht's?“ im Kopf) kurz den Business-Kontext.

## Zwei Ablaufmodi

- **Schritt für Schritt** (Standard): Der Agent führt einen Schritt aus und hält dann an. Es erscheint ein kurzer **Merksatz** zum Schritt, danach geht es mit **Weiter** (oder `→`) zum nächsten Schritt. Mit **Wiederholen** bzw. `←` lässt sich ein Schritt noch einmal zeigen. Ein Klick auf eine Schrittkarte springt direkt dorthin.
- **Automatisch**: Der Agent läuft ohne Unterbrechung durch und hält nur bei der menschlichen Freigabe an.

Das Tempo lässt sich zusätzlich mit **Langsam / Normal / Schnell** einstellen.

| # | Demo-Name | Kundencase | Input |
|---|---|---|---|
| 1 | **AI Call Assistant** ⭐ Hero-Demo | Kundenanrufe zusammenfassen | Telefon |
| 2 | Document Service Agent | Lieferschein/Rechnung versenden | E-Mail |
| 3 | Price Update Agent | Preiserhöhungen ins System | Lieferantenschreiben |
| 4 | KOVIT Agent | KOVIT-Datei aktualisieren | Excel |
| 5 | Price Quality Agent | Fehlende Preise erkennen | Artikelstamm |
| 6 | **Revenue Matching Agent** ⭐ zweite Live-Demo | Gastivo-Umsatzabgleich | Excel + internes System |

Bildschirmaufteilung: links die Use Cases, in der Mitte Grundmuster, Arbeitsschritte und Arbeitsfläche, rechts **Agent Activity** und **Erkannte Informationen**, unten das **Ergebnis**.

## Empfohlener Ablauf (ca. 10–15 Minuten)

1. **Startscreen** – „Was passiert eigentlich, wenn ein KI-Agent einen Geschäftsprozess übernimmt?“ → *Demo starten*
2. Einleitung: *„Das sind keine von uns erfundenen KI-Ideen, sondern Themen, die bereits aus Ihrem Unternehmen gekommen sind.“* Dabei kurz auf die sechs Karten links zeigen.
3. **AI Call Assistant** im Modus *Schritt für Schritt*, nach jedem Schritt mit `→` weiter:
   1. *Input:* Das Transkript entsteht.
   2. *Verstehen:* Die erkannten Stellen werden **im Text markiert** und erscheinen rechts als Felder.
   3. *Infos holen:* Die Bestellung der Vorwoche wird geladen.
   4. *Verarbeiten:* Zusammenfassung und Aufgaben entstehen, die Wassermenge springt von 20 auf 25 Kisten.
   5. *Prüfen:* Der Agent markiert die Kühlwagen-Frage, weil er sie nicht selbst entscheiden kann.
   6. *Freigabe:* **Der Agent wartet auf den Menschen.** Optional *Bearbeiten* klicken und die Zusammenfassung live ändern.
   7. *Ergebnis:* CRM-Gesprächsnotiz.
4. *„Was hat die KI hier gemacht?“* → Abschlussbild mit den fünf Fähigkeiten → *Nächstes Beispiel: Revenue Matching Agent*
5. **Gastivo-Abgleich**, gern zügiger (*Automatisch* oder *Schnell*). Botschaft: Dieselben sieben Schritte funktionieren auch für Excel, Bestellnummern und Datenabgleiche.
6. Abschlussbild → **Eigene Potenziale entdecken** → Potenzial-Board für den interaktiven Teil.

Die übrigen vier Cases bleiben sichtbar und belegen die Breite. Jeder lässt sich mit einem Klick (oder den Tasten 1–6) zeigen.

## Bedienung

| Taste | Funktion |
|---|---|
| `→` / `Bild ab` | Weiter: nächsten Schritt starten bzw. laufenden Schritt sofort abschließen · bei Freigabe: freigeben · am Ende: Abschlussbild |
| `←` / `Bild auf` | Schritt wiederholen bzw. zurück zum vorherigen |
| `Leertaste` | Pause / Fortsetzen |
| `Enter` | Freigabe erteilen (Human-in-the-loop) |
| `R` | Zurücksetzen |
| `1`–`6` | Use Case wählen |
| `L` | Use-Case-Landkarte |
| `P` | Präsentationsmodus (größere Schrift, kompakte Seitenleiste) |
| `F` | Vollbild |
| `Esc` | Abschlussbild schließen |

Ein Presenter (Clicker) sendet in der Regel `Bild ab` / `Bild auf` und steuert die Demo damit direkt.

## Use-Case-Landkarte (weitere Ideen aus den Fachbereichen)

Erreichbar über den Header, die Karte „+ 24 weitere Ideen“ unten in der Seitenleiste, das Abschlussbild oder die Taste `L`.

- **24 Themen in 6 Clustern**: Vertrieb & Kunden, Aufträge & Kundenservice, Bestand & Bestellwesen (WWS), Einkauf/Preise/Stammdaten, Logistik & Fuhrpark, Buchhaltung & DMS.
- Jede Karte erklärt kurz **„Worum geht's?“** (die heutige Situation) und **„Mit KI“** (was der Agent übernimmt).
- Oben sind sie nach der **Art der KI-Unterstützung** gezählt: Auswertung, Kontrolle, Automatisierung, Dokumente, Texte. Ein Klick auf eine dieser Kacheln filtert die Landkarte.
- **Ein Klick auf eine Karte öffnet einen Mini-Agenten**: dieselben sieben Schritte in je einem Satz, dazu ein kleines Beispiel-Ergebnis und der Originalwortlaut aus dem Fachbereich. Bedienung: *Abspielen* oder `Leertaste`, `→`/`←` schrittweise, `Esc` schließt.
- Themen, die schon als Live-Demo existieren (Preiserhöhungen, fehlende Preise), öffnen direkt den passenden Case.

Die Inhalte stehen in `src/ideas/ideas.ts` und lassen sich dort ohne Programmierkenntnisse anpassen. Alle Zahlen sind Beispielwerte.

## Potenzial-Board

Die Brücke in den interaktiven Teil: **„Welche manuellen, wiederkehrenden Aufgaben kosten Sie heute Zeit?“**

- **Impulsfragen** wechseln oben automatisch, z. B. „Wo tippen Sie Daten von einem System ins andere ab?“.
- **Aufgabe erfassen:** Text eingeben und per Klick Bereich, Häufigkeit, Dauer und „Was macht die Aufgabe mühsam?“ wählen (Abtippen, Suchen, Abgleichen, Auswertungen, Mails/Texte). Das Board zeigt sofort den geschätzten Zeitaufwand pro Jahr und wie KI helfen könnte. Nur der Text ist Pflicht, alles andere optional.
- **Priorisieren:** Mit ▲ abstimmen (Punkte-Abfrage). Sortieren nach Stimmen oder nach Zeitaufwand. Oben stehen Anzahl, Gesamtstunden und die häufigste Art.
- **Speichern:** Alles wird automatisch im Browser des Workshop-Rechners gespeichert und übersteht ein Neuladen. Es wird aber nicht geteilt und nicht online gespeichert.
- **Export für Excel:** Lädt alle Aufgaben als CSV herunter (öffnet direkt in Excel). Am besten am Ende des Workshops exportieren.
- **Beispiele einfügen** (nur bei leerem Board) zeigt, wie ein gefülltes Board aussieht. Mit *Leeren* wird alles entfernt.

Die Zeitschätzung rechnet Häufigkeit × Dauer (täglich = 220 Arbeitstage, wöchentlich = 46 Wochen). Sie zeigt den heutigen Aufwand, nicht die Ersparnis durch KI.

## Technik

React 19, TypeScript, Tailwind CSS 4, Motion, Lucide-Icons, Vite.

```
src/
  engine/         Ablauf-Logik (Schritte, Taktgeber, Freigabe, Aktivitätslog)
  components/     Oberfläche: Workflow, Activity-Panel, Start-/Abschluss-/Board-Screen
  scenarios/      Die sechs Use Cases: je Schrittdefinition, Arbeitsfläche, Ergebnis
```

Ein Szenario besteht aus Daten (`steps`, `facts`, `recap`) und zwei Komponenten (`Workspace`, `Output`). Texte, Beispieldaten oder Timings ändert man direkt in der jeweiligen Datei unter `src/scenarios/`. `duration` ist die Schrittdauer in Millisekunden bei Tempo *Normal*, `beats` die Anzahl der Teilschritte, `insight` der Merksatz im Schrittmodus. Das Grundtempo für alle Cases steht in `src/engine/useAgentRun.ts` (`TEMPO`).
