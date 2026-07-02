import { describe, expect, it } from 'vitest'
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
})
