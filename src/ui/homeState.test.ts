import { describe, expect, it } from 'vitest'
import type { ReaderState } from '../engine/types'
import { getHomeEntry } from './homeState'

const base: ReaderState = {
  storyId: 'shanhe',
  chapter: 0,
  beatId: null,
  flags: [],
  log: [],
}

describe('getHomeEntry', () => {
  it('没有存档时进入卷首', () => {
    expect(getHomeEntry(null)).toBe('fresh')
  })

  it('停在第 1 章章封时仍算进入', () => {
    expect(getHomeEntry(base)).toBe('fresh')
  })

  it('第 1 章中途存档可续读', () => {
    expect(getHomeEntry({ ...base, beatId: 'b2' })).toBe('resume')
  })

  it('过章后的章封存档可续读', () => {
    expect(getHomeEntry({ ...base, chapter: 1 })).toBe('resume')
  })

  it('结局存档优先于续读', () => {
    expect(getHomeEntry({ ...base, chapter: 11, ended: { endingId: 'e-child' } })).toBe('ending')
  })

  it('带节拍的结局存档仍按结局处理', () => {
    expect(getHomeEntry({ ...base, chapter: 11, beatId: 'b1', ended: { endingId: 'e-child' } })).toBe('ending')
  })
})
