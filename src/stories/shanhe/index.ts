import { storySchema, type Story } from '../schema'
import { ch01 } from './ch01'
import { ch02 } from './ch02'
import { ch03 } from './ch03'

// 章节随任务推进逐个追加；结局表 Task 12 定稿，此前仅兜底。
export const shanhe: Story = storySchema.parse({
  id: 'shanhe',
  title: '山河十四年',
  tagline: '1931—1945，一个记者走过的中国',
  chapters: [ch01, ch02, ch03],
  endings: [{ id: 'e-home', title: '还乡', epilogue: '十四年后，你回到了出发的地方。' }],
})
