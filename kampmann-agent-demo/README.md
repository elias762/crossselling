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

Alle sechs Use Cases nutzen **dieselbe Agentenoberfläche**. Es wechselt nur das Szenario. So erkennt jeder das Muster:

**Input → Verstehen → Informationen holen → Verarbeiten → Prüfen → Menschliche Freigabe → Ergebnis**

| # | Demo-Name | Kundencase | Input |
|---|---|---|---|
| 1 | **AI Call Assistant** ⭐ Hero-Demo | Kundenanrufe zusammenfassen | Telefon |
| 2 | Document Service Agent | Lieferschein/Rechnung versenden | E-Mail |
| 3 | Price Update Agent | Preiserhöhungen ins System | Lieferantenschreiben |
| 4 | KOVIT Agent | KOVIT-Datei aktualisieren | Excel |
| 5 | Price Quality Agent | Fehlende Preise erkennen | Artikelstamm |
| 6 | **Revenue Matching Agent** ⭐ zweite Live-Demo | Gastivo-Umsatzabgleich | Excel + internes System |

Bildschirmaufteilung: links die Use Cases, in der Mitte Grundmuster, Arbeitsschritte und Arbeitsfläche, rechts **Agent Activity** und **Erkannte Informationen**, unten das **Ergebnis**.

## Empfohlener Ablauf (ca. 10 Minuten)

1. **Startscreen** – „Was passiert eigentlich, wenn ein KI-Agent einen Geschäftsprozess übernimmt?“ → *Demo starten*
2. Einleitung: *„Das sind keine von uns erfundenen KI-Ideen, sondern Themen, die bereits aus Ihrem Unternehmen gekommen sind.“* Dabei kurz auf die sechs Karten links zeigen.
3. **AI Call Assistant** abspielen (Leertaste):
   - Das Transkript entsteht, danach werden die erkannten Stellen **im Text markiert** und erscheinen rechts als Felder.
   - Die Kundenhistorie wird geladen, die Wassermenge springt sichtbar von 20 auf 25 Kisten.
   - **Der Agent stoppt bei „Mitarbeiter prüft“.** Hier kurz innehalten: *„Automatisieren, wo es sinnvoll ist. Prüfen, wo es wichtig ist.“* Optional *Bearbeiten* klicken und die Zusammenfassung live ändern. Die Änderung landet in der Gesprächsnotiz.
   - Freigeben → CRM-Gesprächsnotiz.
4. *„Was hat die KI hier gemacht?“* → Abschlussbild mit den fünf Fähigkeiten → *Nächstes Beispiel: Revenue Matching Agent*
5. **Gastivo-Abgleich** abspielen. Botschaft: dasselbe Prinzip funktioniert auch für Excel, Bestellnummern und Datenabgleiche. Die Abweichung 100571 wird nicht automatisch geändert, sondern an einen Menschen übergeben.
6. Abschlussbild → **Eigene Potenziale entdecken** → Potenzial-Board für den interaktiven Teil.

Die übrigen vier Cases bleiben sichtbar und belegen die Breite. Jeder lässt sich mit einem Klick (oder den Tasten 1–6) zeigen.

## Bedienung

| Taste | Funktion |
|---|---|
| `Leertaste` | Start / Pause / Fortsetzen (bei Freigabe: freigeben) |
| `Enter` | Freigabe erteilen (Human-in-the-loop) |
| `R` | Zurücksetzen |
| `1`–`6` | Use Case wählen |
| `P` | Präsentationsmodus (größere Schrift, kompakte Seitenleiste) |
| `F` | Vollbild |
| `→` | nach Abschluss: Abschlussbild · im Abschlussbild: Potenzial-Board |
| `←` / `Esc` | Abschlussbild schließen |

Die Geschwindigkeit lässt sich mit **1x / 2x** umschalten. 2x eignet sich für die vier Cases, die nur kurz gezeigt werden.

## Potenzial-Board

Fünf Spalten (Verstehen, Suchen, Strukturieren, Handeln, Prüfen), jeweils mit Leitfrage. Notizen lassen sich direkt im Workshop eintippen. Sie werden lokal im Browser gespeichert und lassen sich über *Board leeren* zurücksetzen.

## Technik

React 19, TypeScript, Tailwind CSS 4, Motion, Lucide-Icons, Vite.

```
src/
  engine/         Ablauf-Logik (Schritte, Taktgeber, Freigabe, Aktivitätslog)
  components/     Oberfläche: Workflow, Activity-Panel, Start-/Abschluss-/Board-Screen
  scenarios/      Die sechs Use Cases: je Schrittdefinition, Arbeitsfläche, Ergebnis
```

Ein Szenario besteht aus Daten (`steps`, `facts`, `recap`) und zwei Komponenten (`Workspace`, `Output`). Texte, Beispieldaten oder Timings ändert man direkt in der jeweiligen Datei unter `src/scenarios/`. `duration` ist die Schrittdauer bei 1x in Millisekunden, `beats` die Anzahl der Teilschritte.
