import type { ComponentType } from 'react'
import type { IconKey } from '../components/icons'

/** Die sieben Grundphasen, die in jedem Use Case gleich sind. */
export type PhaseId = 'input' | 'verstehen' | 'holen' | 'verarbeiten' | 'pruefen' | 'freigabe' | 'ergebnis'

export type Tone = 'info' | 'success' | 'warning' | 'human' | 'data'

export interface Activity {
  text: string
  /** Zeitpunkt innerhalb des Schritts (0 = beim Start, beats = beim Abschluss). */
  beat?: number
  tone?: Tone
}

export interface HumanGate {
  approve: string
  edit: string
  /** Kurzer Text, was der Mensch hier entscheidet. */
  question: string
  /** Hinweis, der beim Klick auf „Bearbeiten“ erscheint (falls der Workspace keine eigene Bearbeitung hat). */
  editHint?: string
}

export interface StepDef {
  title: string
  description: string
  phase: PhaseId
  icon: IconKey
  /** Anzahl der Teilschritte, z. B. 7 erkannte Felder nacheinander. */
  beats?: number
  /** Dauer bei 1x in Millisekunden. */
  duration?: number
  activities: Activity[]
  human?: HumanGate
}

export interface Fact {
  label: string
  value: string
  step: number
  beat?: number
  tone?: Tone
}

export interface Recap {
  verstehen: string
  suchen: string
  strukturieren: string
  handeln: string
  pruefen: string
}

export type RunStatus = 'idle' | 'running' | 'paused' | 'awaiting' | 'done'

export interface Progress {
  step: number
  beat: number
  status: RunStatus
  speed: number
  editing: boolean
  finished: boolean
  /** Wurde Schritt `step` (und darin Teilschritt `beat`) bereits erreicht? */
  reached: (step: number, beat?: number) => boolean
  /** Ist Schritt `step` gerade aktiv? */
  active: (step: number) => boolean
  /** Ist Schritt `step` vollständig abgeschlossen? */
  done: (step: number) => boolean
  /** Dauer eines Schritts in ms bei aktueller Geschwindigkeit. */
  stepMs: (step: number) => number
}

export interface ScenarioProps {
  p: Progress
}

export interface ScenarioDef {
  id: string
  name: string
  subtitle: string
  /** Kundencase in der Sprache des Unternehmens. */
  origin: string
  icon: IconKey
  /** Woher kommt der Input? z. B. „Telefon“, „E-Mail“, „Excel“ */
  source: string
  /** Simulierte Uhrzeit für den Aktivitätsfeed (Sekunden seit Mitternacht). */
  clockStart: number
  steps: StepDef[]
  facts: Fact[]
  recap: Recap
  /** Empfehlung für den nächsten Case in der Präsentation. */
  next?: string
  outputTitle: string
  /** Ab welchem Schritt das Ergebnis unten sichtbar wird (Standard: letzter Schritt). */
  outputFrom?: number
  Workspace: ComponentType<ScenarioProps>
  Output: ComponentType<ScenarioProps>
}

export interface LogEntry {
  id: number
  text: string
  tone: Tone
  time: string
  step: number
}
