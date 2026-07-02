import { beforeEach, describe, expect, it } from 'vitest'
import type { ReaderState } from './types'
import { clearProgress, loadProgress, saveProgress } from './storage'

const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  } as Storage
})

const st: ReaderState = { storyId: 'demo', chapter: 1, beatId: 'b2', flags: ['左'], log: [] }

describe('storage', () => {
  it('存后可读回', () => {
    saveProgress(st)
    expect(loadProgress('demo')).toEqual(st)
  })
  it('无存档返回 null', () => {
    expect(loadProgress('nope')).toBeNull()
  })
  it('损坏 JSON 返回 null', () => {
    store.set('floating-life:save:demo', '{oops')
    expect(loadProgress('demo')).toBeNull()
  })
  it('clear 后读不到', () => {
    saveProgress(st)
    clearProgress('demo')
    expect(loadProgress('demo')).toBeNull()
  })
})
