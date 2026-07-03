import { storySchema, type Story } from '../schema'
import { ch01 } from './ch01'
import { ch02 } from './ch02'
import { ch03 } from './ch03'
import { ch04 } from './ch04'
import { ch05 } from './ch05'
import { ch06 } from './ch06'
import { ch07 } from './ch07'
import { ch08 } from './ch08'
import { ch09 } from './ch09'
import { ch10 } from './ch10'
import { ch11 } from './ch11'
import { ch12 } from './ch12'

// 全书 12 章齐整；结局表已定稿（顺序即优先级，末项无 when 兜底）。
export const shanhe: Story = storySchema.parse({
  id: 'shanhe',
  title: '山河十四年',
  tagline: '1931—1945 · 据史实与亲历记载改编',
  cover: 'ch01.jpg',
  chapters: [ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09, ch10, ch11, ch12],
  endings: [
    {
      id: 'e-pen',
      when: '直笔 & 发稿 & !弃笔',
      title: '秉笔十四年',
      epilogue:
        '战后清点旧稿，从苏州河到中原，你没有写过一个自己不信的字。有人问你怕过没有，你说：怕过，每一次都怕。可十四年了，笔比你勇敢。',
    },
    {
      id: 'e-child',
      when: '携孤',
      title: '一起还乡',
      epilogue:
        '沈阳的雪落下来的时候，小满站在你家老宅的门槛上，替你念出了门楣上剩下的半块匾。你在他身后站着，没有接话。',
    },
    {
      id: 'e-sword',
      when: '弃笔',
      title: '投笔之后',
      epilogue:
        '你把最后一篇没写完的稿子留在了黔南的工事里。胜利那天你摸了摸口袋，只有一枚弹壳。',
    },
    {
      id: 'e-home',
      title: '还乡',
      epilogue:
        '十四年，三千里，你回到了出发的月台。站牌换过三次，月台还是那个月台。你放下行李，站了一会儿，走出站去，像每一个还乡的人。',
    },
  ],
})
