import { describe, expect, it } from 'vitest'
import { resolveEnding } from '../../engine/finale'
import { shanhe } from './index'

describe('山河十四年 内容完整性', () => {
  it('每章 historyNote 必填且 ≥80 字', () => {
    for (const ch of shanhe.chapters) {
      expect(ch.historyNote, `${ch.title} 缺史实注`).toBeTruthy()
      expect(ch.historyNote!.length, `${ch.title} 史实注过短`).toBeGreaterThanOrEqual(80)
    }
  })
  it('每个 beat narrative ≥100 字', () => {
    for (const ch of shanhe.chapters)
      for (const b of ch.beats)
        expect(b.narrative.length, `${ch.title}/${b.id} 文案过短`).toBeGreaterThanOrEqual(100)
  })
  it('每章至少一处选择', () => {
    for (const ch of shanhe.chapters) expect(ch.beats.some((b) => b.choices)).toBe(true)
  })
  it('全书 12 章', () => {
    expect(shanhe.chapters.length).toBe(12)
  })
  it('四结局均可达', () => {
    expect(resolveEnding(shanhe, ['直笔', '发稿']).id).toBe('e-pen')
    expect(resolveEnding(shanhe, ['携孤']).id).toBe('e-child')
    expect(resolveEnding(shanhe, ['弃笔']).id).toBe('e-sword')
    expect(resolveEnding(shanhe, []).id).toBe('e-home')
  })
  it('秉笔优先于携孤（顺序即优先级）', () => {
    expect(resolveEnding(shanhe, ['直笔', '发稿', '携孤']).id).toBe('e-pen')
  })
})
