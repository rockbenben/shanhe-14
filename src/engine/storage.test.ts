import { beforeEach, describe, expect, it } from 'vitest'
import type { ReaderState } from './types'
import { demoStory } from './fixtures'
import { clearProgress, loadProgress, saveProgress, validProgress } from './storage'

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
  it('存档 storyId 与请求不符返回 null', () => {
    store.set('floating-life:save:other', JSON.stringify({ v: 1, st }))
    expect(loadProgress('other')).toBeNull()
  })
})

describe('validProgress', () => {
  it('chapter 越界返回 null', () => {
    const bad: ReaderState = { storyId: 'demo', chapter: 99, beatId: null, flags: [], log: [] }
    expect(validProgress(demoStory, bad)).toBeNull()
  })
  it('beatId 在当前章已不存在时返回 null', () => {
    const bad: ReaderState = { storyId: 'demo', chapter: 0, beatId: 'ghost', flags: [], log: [] }
    expect(validProgress(demoStory, bad)).toBeNull()
  })
  it('ended.endingId 已不存在时返回 null', () => {
    const bad: ReaderState = {
      storyId: 'demo',
      chapter: 1,
      beatId: null,
      flags: [],
      log: [],
      ended: { endingId: 'ghost' },
    }
    expect(validProgress(demoStory, bad)).toBeNull()
  })
  it('完好的存档原样返回', () => {
    const ok: ReaderState = { storyId: 'demo', chapter: 0, beatId: 'b2', flags: ['左'], log: [] }
    expect(validProgress(demoStory, ok)).toEqual(ok)
  })
  it('null 输入返回 null', () => {
    expect(validProgress(demoStory, null)).toBeNull()
  })
})
