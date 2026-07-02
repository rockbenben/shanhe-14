import type { ReaderState } from './types'

const key = (storyId: string) => `floating-life:save:${storyId}`

export function saveProgress(st: ReaderState): void {
  localStorage.setItem(key(st.storyId), JSON.stringify({ v: 1, st }))
}

export function loadProgress(storyId: string): ReaderState | null {
  const raw = localStorage.getItem(key(storyId))
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as { v: number; st: ReaderState }
    return data.v === 1 && data.st?.storyId === storyId ? data.st : null
  } catch {
    return null
  }
}

export function clearProgress(storyId: string): void {
  localStorage.removeItem(key(storyId))
}
