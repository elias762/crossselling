import { useSyncExternalStore } from 'react'

/** Minimaler geteilter Zustand zwischen Arbeitsfläche und Ergebnis eines Use Cases. */
export function createStore<T>(initial: T) {
  let value = initial
  const subs = new Set<() => void>()
  const set = (v: T) => {
    value = v
    subs.forEach((f) => f())
  }
  const subscribe = (f: () => void) => {
    subs.add(f)
    return () => subs.delete(f)
  }
  const use = () => useSyncExternalStore(subscribe, () => value)
  return { use, set, get: () => value, reset: () => set(initial) }
}
