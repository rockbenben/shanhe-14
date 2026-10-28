import type { ReaderState } from '../engine/types'

export type HomeEntry = 'fresh' | 'resume' | 'ending'

export function getHomeEntry(saved: ReaderState | null): HomeEntry {
  if (!saved) return 'fresh'
  if (saved.ended) return 'ending'
  if (saved.chapter > 0 || saved.beatId !== null) return 'resume'
  return 'fresh'
}
