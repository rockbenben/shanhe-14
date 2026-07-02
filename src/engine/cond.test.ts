import { describe, expect, it } from 'vitest'
import { checkCond } from './cond'

describe('checkCond', () => {
  it('undefined 恒真', () => {
    expect(checkCond(undefined, [])).toBe(true)
  })
  it('单 flag 命中/未命中', () => {
    expect(checkCond('直笔', ['直笔'])).toBe(true)
    expect(checkCond('直笔', [])).toBe(false)
  })
  it('取反', () => {
    expect(checkCond('!弃笔', [])).toBe(true)
    expect(checkCond('!弃笔', ['弃笔'])).toBe(false)
  })
  it('与连接（含空格容错）', () => {
    expect(checkCond('直笔 & 发稿 & !弃笔', ['直笔', '发稿'])).toBe(true)
    expect(checkCond('直笔&发稿', ['直笔'])).toBe(false)
  })
})
