import { describe, expect, it } from 'vitest'
import { demoStory } from './fixtures'
import { advance, choose, currentBeat, enterChapter, startStory } from './reader'

describe('reader', () => {
  it('startStory 停在第一章封面', () => {
    const st = startStory(demoStory)
    expect(st.chapter).toBe(0)
    expect(st.beatId).toBeNull()
  })
  it('enterChapter 进入 entry beat', () => {
    const st = enterChapter(demoStory, startStory(demoStory))
    expect(currentBeat(demoStory, st).id).toBe('b1')
  })
  it('choose 落 flag、记 log、按 to 跳转', () => {
    const st = choose(demoStory, enterChapter(demoStory, startStory(demoStory)), 0)
    expect(st.flags).toContain('左')
    expect(st.log.at(-1)).toEqual({ chapter: 0, beatId: 'b1', choiceText: '向左' })
    expect(st.beatId).toBe('b2')
  })
  it('advance 按 flag 解析条件 next', () => {
    let st = choose(demoStory, enterChapter(demoStory, startStory(demoStory)), 0)
    st = advance(demoStory, st) // b2 -[左]-> b3
    expect(st.beatId).toBe('b3')
  })
  it('无 flag 时条件 next 落兜底并跨章（回到章封面）', () => {
    let st = choose(demoStory, enterChapter(demoStory, startStory(demoStory)), 1)
    st = advance(demoStory, st) // b2 -> $end -> 第二章封面
    expect(st.chapter).toBe(1)
    expect(st.beatId).toBeNull()
    expect(st.ended).toBeUndefined()
  })
  it('末章走完判定结局', () => {
    let st = choose(demoStory, enterChapter(demoStory, startStory(demoStory)), 0)
    st = advance(demoStory, st) // -> b3
    st = advance(demoStory, st) // -> 第二章
    st = enterChapter(demoStory, st)
    st = advance(demoStory, st) // 末章 $end
    expect(st.ended?.endingId).toBe('e-left')
  })
  it('在选择节点调 advance 抛错；choose 越界抛错', () => {
    const st = enterChapter(demoStory, startStory(demoStory))
    expect(() => advance(demoStory, st)).toThrow()
    expect(() => choose(demoStory, st, 9)).toThrow()
  })
})
