import type { Story } from '../stories/schema'
import type { ReaderState } from './types'

const key = (storyId: string) => `floating-life:save:${storyId}`

export function saveProgress(st: ReaderState): void {
  try {
    localStorage.setItem(key(st.storyId), JSON.stringify({ v: 1, st }))
  } catch {
    // localStorage 可能被禁用或配额已满，静默放弃保存
  }
}

export function loadProgress(storyId: string): ReaderState | null {
  try {
    const raw = localStorage.getItem(key(storyId))
    if (!raw) return null
    const data = JSON.parse(raw) as { v: number; st: ReaderState }
    return data.v === 1 && data.st?.storyId === storyId ? data.st : null
  } catch {
    return null
  }
}

export function clearProgress(storyId: string): void {
  try {
    localStorage.removeItem(key(storyId))
  } catch {
    // 同上，静默放弃
  }
}

// 旧存档防线：章节/节点/结局 id 必须仍存在于当前故事，否则弃档（内容改版后避免白屏）
export function validProgress(story: Story, st: ReaderState | null): ReaderState | null {
  if (!st) return null
  const ch = story.chapters[st.chapter]
  if (!ch) return null
  if (st.beatId !== null && !ch.beats.some((b) => b.id === st.beatId)) return null
  if (st.ended && !story.endings.some((e) => e.id === st.ended!.endingId)) return null
  return st
}
