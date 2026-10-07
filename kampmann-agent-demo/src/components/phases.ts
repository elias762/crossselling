import type { PhaseId } from '../engine/types'
import type { IconKey } from './icons'

export const PHASES: { id: PhaseId; label: string; short: string; icon: IconKey }[] = [
  { id: 'input', label: 'Input', short: 'Input', icon: 'inbox' },
  { id: 'verstehen', label: 'Verstehen', short: 'Verstehen', icon: 'brain' },
  { id: 'holen', label: 'Informationen holen', short: 'Infos holen', icon: 'database' },
  { id: 'verarbeiten', label: 'Verarbeiten', short: 'Verarbeiten', icon: 'layers' },
  { id: 'pruefen', label: 'Prüfen', short: 'Prüfen', icon: 'clipboard' },
  { id: 'freigabe', label: 'Menschliche Freigabe', short: 'Freigabe', icon: 'human' },
  { id: 'ergebnis', label: 'Ergebnis', short: 'Ergebnis', icon: 'check' },
]

