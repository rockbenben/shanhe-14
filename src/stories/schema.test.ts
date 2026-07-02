import { describe, expect, it } from 'vitest'
import { storySchema } from './schema'

const validStory = {
  id: 'demo',
  title: '示例',
  tagline: '一个用于测试的极小故事',
  chapters: [
    {
      id: 'c1', title: '第一章', entry: 'b1',
      beats: [
        {
          id: 'b1', narrative: '开场。',
          choices: [
            { text: '向左', set: ['左'], to: 'b2' },
            { text: '向右', to: 'b2' },
          ],
        },
        { id: 'b2', narrative: '路口。', next: [{ when: '左', to: 'b3' }, { to: '$end' }] },
        { id: 'b3', narrative: '左途尽头。', next: '$end' },
      ],
    },
  ],
  endings: [
    { id: 'e-left', when: '左', title: '左途', epilogue: '你走了左边。' },
    { id: 'e-def', title: '归途', epilogue: '你回了家。' },
  ],
}

const clone = () => structuredClone(validStory)

describe('storySchema', () => {
  it('合法故事通过', () => {
    expect(() => storySchema.parse(validStory)).not.toThrow()
  })
  it('beat 必须恰有 choices 或 next 之一', () => {
    const s = clone()
    delete (s.chapters[0].beats[2] as Record<string, unknown>).next
    expect(() => storySchema.parse(s)).toThrow(/choices 或 next/)
  })
  it('引用不存在的 beat 被拒', () => {
    const s = clone()
    s.chapters[0].beats[0].choices![0].to = 'ghost'
    expect(() => storySchema.parse(s)).toThrow(/ghost/)
  })
  it('条件 next 最后一项必须无 when（兜底）', () => {
    const s = clone()
    s.chapters[0].beats[1].next = [{ when: '左', to: 'b3' }]
    expect(() => storySchema.parse(s)).toThrow(/兜底/)
  })
  it('beat 图有环被拒', () => {
    const s = clone()
    s.chapters[0].beats[2].next = 'b1'
    expect(() => storySchema.parse(s)).toThrow(/环/)
  })
  it('entry 不可达的 beat 被拒', () => {
    const s = clone()
    s.chapters[0].beats.push({ id: 'orphan', narrative: '孤岛节点。', next: '$end' })
    expect(() => storySchema.parse(s)).toThrow(/不可达/)
  })
  it('最后一个结局必须无 when，其余必须有 when', () => {
    const bad1 = clone()
    bad1.endings[1].when = '左'
    expect(() => storySchema.parse(bad1)).toThrow(/兜底结局/)
    const bad2 = clone()
    delete (bad2.endings[0] as Record<string, unknown>).when
    expect(() => storySchema.parse(bad2)).toThrow(/兜底结局/)
  })
})
