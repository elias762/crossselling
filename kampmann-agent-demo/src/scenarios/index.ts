import type { ScenarioDef } from '../engine/types'
import { callScenario } from './call'
import { documentScenario } from './document'
import { priceScenario } from './price'
import { kovitScenario } from './kovit'
import { qualityScenario } from './quality'
import { revenueScenario } from './revenue'

/** Reihenfolge = Reihenfolge in der Seitenleiste (Tasten 1–6). */
export const SCENARIOS: ScenarioDef[] = [callScenario, documentScenario, priceScenario, kovitScenario, qualityScenario, revenueScenario]
