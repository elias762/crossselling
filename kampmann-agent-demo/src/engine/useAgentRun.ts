import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { Activity, LogEntry, Progress, RunStatus, ScenarioDef, StepDef, Tone } from './types'

/** Grundtempo: alle Schrittdauern werden damit gestreckt (ruhiger zum Erklären). */
export const TEMPO = 1.3

interface RunState {
  step: number
  beat: number
  status: RunStatus
  editing: boolean
  log: LogEntry[]
  clock: number
  seq: number
}

type Action =
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'reset' }
  | { type: 'tick'; stepMode: boolean }
  | { type: 'next' }
  | { type: 'goto'; step: number }
  | { type: 'approve' }
  | { type: 'edit' }

const initial = (clockStart: number): RunState => ({
  step: -1,
  beat: 0,
  status: 'idle',
  editing: false,
  log: [],
  clock: clockStart,
  seq: 0,
})

const beatsOf = (s: StepDef) => s.beats ?? 1

function fmtClock(sec: number) {
  const h = Math.floor(sec / 3600) % 24
  const m = Math.floor(sec / 60) % 60
  const s = sec % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

function push(state: RunState, entries: { text: string; tone?: Tone }[], step: number): RunState {
  if (!entries.length) return state
  let { clock, seq } = state
  const log = [...state.log]
  for (const e of entries) {
    clock += 1 + (seq % 3) // deterministisch, wirkt aber natürlich
    seq += 1
    log.push({ id: seq, text: e.text, tone: e.tone ?? 'info', time: fmtClock(clock), step })
  }
  return { ...state, log, clock, seq }
}

const at = (acts: Activity[], beat: number) => acts.filter((a) => (a.beat ?? 0) === beat)

function makeReducer(scenario: ScenarioDef) {
  const { steps } = scenario
  const last = steps.length - 1

  function enterStep(state: RunState, index: number): RunState {
    if (index > last) {
      return push({ ...state, step: steps.length, beat: 0, status: 'done', editing: false }, [{ text: 'Vorgang abgeschlossen', tone: 'success' }], last)
    }
    const next = { ...state, step: index, beat: 0, status: 'running' as RunStatus, editing: false }
    return push(next, at(steps[index].activities, 0), index)
  }

  /** Einen Teilschritt weiter; liefert am Schrittende „awaiting“ (Freigabe) bzw. „hold“ (Schrittmodus). */
  function advance(state: RunState, stepMode: boolean): RunState {
    const s = steps[state.step]
    const beats = beatsOf(s)
    if (state.beat < beats) {
      const beat = state.beat + 1
      let next = push({ ...state, beat }, at(s.activities, beat), state.step)
      if (beat === beats && s.human) {
        next = push({ ...next, status: 'awaiting' }, [{ text: 'Mitarbeiterfreigabe erforderlich', tone: 'human' }], state.step)
      } else if (beat === beats && stepMode && state.step < last) {
        next = { ...next, status: 'hold' }
      }
      return next
    }
    return enterStep(state, state.step + 1)
  }

  function approve(state: RunState): RunState {
    const approved = push(state, [{ text: 'Freigabe durch Mitarbeiter erteilt', tone: 'success' }], state.step)
    return enterStep(approved, state.step + 1)
  }

  return (state: RunState, action: Action): RunState => {
    switch (action.type) {
      case 'reset':
        return initial(scenario.clockStart)
      case 'start':
        if (state.status === 'idle') return enterStep(state, 0)
        if (state.status === 'paused') return { ...state, status: 'running' }
        if (state.status === 'hold') return enterStep(state, state.step + 1)
        if (state.status === 'done') return enterStep(initial(scenario.clockStart), 0)
        return state
      case 'pause':
        return state.status === 'running' ? { ...state, status: 'paused' } : state
      case 'edit':
        return state.status === 'awaiting' ? { ...state, editing: !state.editing } : state
      case 'approve':
        return state.status === 'awaiting' ? approve(state) : state
      case 'tick':
        return state.status === 'running' ? advance(state, action.stepMode) : state
      case 'next': {
        // „Weiter“: nächsten Schritt starten bzw. den laufenden sofort abschließen
        if (state.status === 'idle') return enterStep(state, 0)
        if (state.status === 'hold') return enterStep(state, state.step + 1)
        if (state.status === 'awaiting') return approve(state)
        if (state.status === 'running' || state.status === 'paused') {
          let s: RunState = { ...state, status: 'running' }
          const target = state.step
          while (s.step === target && s.status === 'running') s = advance(s, true)
          return s
        }
        return state
      }
      case 'goto': {
        // Zu einem Schritt springen: alles davor wird im Schnelldurchlauf erledigt
        const target = Math.max(0, Math.min(last, action.step))
        let s = enterStep(initial(scenario.clockStart), 0)
        for (let guard = 0; s.step < target && guard < 500; guard++) {
          s = s.status === 'awaiting' ? approve(s) : advance({ ...s, status: 'running' }, false)
        }
        return { ...s, status: 'running' }
      }
    }
  }
}

export function useAgentRun(scenario: ScenarioDef, speed: number, stepMode: boolean) {
  const reducer = useMemo(() => makeReducer(scenario), [scenario])
  // Hinweis: Die Komponente, die diesen Hook nutzt, wird pro Use Case per `key` neu gemountet.
  const [state, dispatch] = useReducer(reducer, scenario.clockStart, initial)
  const { steps } = scenario

  // Taktgeber
  useEffect(() => {
    if (state.status !== 'running') return
    const s = steps[state.step]
    if (!s) return
    const beats = beatsOf(s)
    const perBeat = ((s.duration ?? 1300) * TEMPO) / beats
    const delay = state.beat < beats ? perBeat / speed : 500 / speed
    const t = window.setTimeout(() => dispatch({ type: 'tick', stepMode }), delay)
    return () => window.clearTimeout(t)
  }, [state.status, state.step, state.beat, speed, steps, stepMode])

  const progress: Progress = useMemo(() => {
    const finished = state.status === 'done'
    return {
      step: state.step,
      beat: state.beat,
      status: state.status,
      speed,
      editing: state.editing,
      finished,
      holding: state.status === 'hold',
      reached: (step, beat = 0) => state.step > step || (state.step === step && state.beat >= beat),
      active: (step) => state.step === step && !finished,
      done: (step) =>
        state.step > step || (state.step === step && state.beat >= beatsOf(steps[step]) && state.status !== 'awaiting'),
      stepMs: (step) => ((steps[step]?.duration ?? 1300) * TEMPO) / speed,
    }
  }, [state.step, state.beat, state.status, state.editing, speed, steps])

  const start = useCallback(() => dispatch({ type: 'start' }), [])
  const pause = useCallback(() => dispatch({ type: 'pause' }), [])
  const next = useCallback(() => dispatch({ type: 'next' }), [])
  const goto = useCallback((step: number) => dispatch({ type: 'goto', step }), [])
  const approve = useCallback(() => dispatch({ type: 'approve' }), [])
  const edit = useCallback(() => dispatch({ type: 'edit' }), [])

  return { progress, log: state.log, start, pause, next, goto, approve, edit }
}
