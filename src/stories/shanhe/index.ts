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
      photo: {
        file: 'end-pen.jpg',
        credit: '在美中国报界记者群像，1921 年 · 美国国会图书馆 · Wikimedia Commons · 公有领域（非该场景实拍）',
        url: 'https://commons.wikimedia.org/wiki/File:Chinese_correspondents,_12-11-21_LOC_npcc.05537.jpg',
      },
      when: '直笔 & 发稿 & !弃笔',
      title: '秉笔十四年',
      epilogue:
        '战后清点旧稿，从苏州河到中原，你没有写过一个自己不信的字。有人问你怕过没有，你说：怕过，每一次都怕。可十四年了，笔比你勇敢。',
    },
    {
      id: 'e-child',
      photo: {
        file: 'end-child.jpg',
        credit: '奉天（沈阳）城郊街市俯瞰，约 1900 年 · 法国国家图书馆 · Wikimedia Commons · 公有领域（非该场景实拍）',
        url: 'https://commons.wikimedia.org/wiki/File:Faubourg_de_Moukden.jpg',
      },
      when: '携孤',
      title: '一起还乡',
      epilogue:
        '沈阳的雪落下来的时候，小满站在你家老宅的门槛上，替你念出了门楣上剩下的半块匾。你在他身后站着，没有接话。',
    },
    {
      id: 'e-sword',
      photo: {
        file: 'end-sword.jpg',
        credit: '中国士兵徒步过怒江吊桥开赴前线，1944 年 7 月 · 美国陆军通信兵 · Wikimedia Commons · 公有领域（非该场景实拍）',
        url: 'https://commons.wikimedia.org/wiki/File:SC_193045-S_-_Chinese_soldiers_march_to_front_crossing_treacherous_Salween_River_by_means_of_temporary_suspension_bridge._Bridge_was_blown_up_two_years_ago_by_Chinese_as_defense_measure_against_Jap_advance._(53400587055).jpg',
      },
      when: '弃笔',
      title: '投笔之后',
      epilogue:
        '你把最后一篇没写完的稿子留在了黔南的工事里。胜利那天你摸了摸口袋，只有一枚弹壳。',
    },
    {
      id: 'e-home',
      photo: {
        file: 'end-home.jpg',
        credit: '奉天驿（沈阳站）站前广场，战前 · 满铁沿线明信片 · Wikimedia Commons · 公有领域（非该场景实拍）',
        url: 'https://commons.wikimedia.org/wiki/File:Mukden_Station_02.jpg',
      },
      title: '还乡',
      epilogue:
        '十四年，三千里，你回到了出发的月台。站牌换过三次，月台还是那个月台。你放下行李，站了一会儿，走出站去，像每一个还乡的人。',
    },
  ],
})
