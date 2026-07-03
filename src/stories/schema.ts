import { z } from 'zod'

// 章内终点哨兵：beat 的 to/next 指向它即「本章完」。
export const CHAPTER_END = '$end'

// 条件表达式：`&` 连接、可 `!` 取反（求值见 engine/cond.ts）。
const condSchema = z.string().regex(/^\s*!?[^\s&!]+(\s*&\s*!?[^\s&!]+)*\s*$/, '条件表达式只支持 & 与 ! 组合')

// 线性去向：beat id / '$end'，或按 flag 分派的条件表（首个满足者胜出）。
const nextRefSchema = z.union([
  z.string().min(1),
  z
    .array(z.object({ when: condSchema.optional(), to: z.string().min(1) }))
    .min(1)
    .refine((arr) => arr[arr.length - 1].when === undefined, {
      message: '条件 next 的最后一项必须无 when（兜底）',
    }),
])

const choiceSchema = z.object({
  text: z.string().min(1),
  set: z.array(z.string().min(1)).optional(), // 落下的 flag（选择的全部后果——没有数值）
  to: z.string().min(1),
  // 选择后的即时回应：先浮现这一行，读者点「继续」才进下一拍——让每个选择都被看见
  reaction: z.string().optional(),
})

const beatSchema = z.object({
  id: z.string().min(1),
  narrative: z.string().min(1),
  // 回响徽记：本拍是早前选择的条件变体时，一句「因为你……」——让跨章回响在兑现时被看见
  echo: z.string().optional(),
  // 史料出处注：本拍剧情取材真实记载时注明（如「据朱学勤《火车上的记忆》」）——正文下小字呈现
  source: z.string().optional(),
  // 真实照片拍：公共历史事件在有合规公版照片时以档案照片为幕（file 在 public/covers/ 下），credit 为出处署名
  photo: z.object({ file: z.string().min(1), credit: z.string().min(1) }).optional(),
  art: z.string().optional(),
  gen: z.enum(['flux', 'gemini']).optional(),
  choices: z.array(choiceSchema).min(2).max(4).optional(),
  next: nextRefSchema.optional(),
})

const chapterSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  epigraph: z.string().optional(), // 章引
  historyNote: z.string().optional(), // 史实注：本章的真实底本与出处线索
  art: z.string().optional(), // 章封影像文件名（public/covers/<art>，含扩展名）；历史题材用真实档案照片
  artCredit: z.string().optional(), // 影像来源署名（如「日军入沈阳，1931 · Wikimedia Commons · 公有领域」）
  // 影像志补充照片（不上章封，仅在卷末影像志陈列）：public/covers/<file> + 出处署名
  artExtra: z.array(z.object({ file: z.string().min(1), credit: z.string().min(1) })).optional(),
  entry: z.string().min(1),
  beats: z.array(beatSchema).min(1),
})

const endingSchema = z.object({
  id: z.string().min(1),
  when: condSchema.optional(),
  title: z.string().min(1),
  epilogue: z.string().min(1),
  art: z.string().optional(),
})

export const storySchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    tagline: z.string().min(1),
    cover: z.string().optional(),
    chapters: z.array(chapterSchema).min(1),
    endings: z.array(endingSchema).min(1),
  })
  .superRefine((story, ctx) => {
    // 章节 id 不得重复
    const seenChapterIds = new Set<string>()
    story.chapters.forEach((ch, ci) => {
      if (seenChapterIds.has(ch.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['chapters', ci, 'id'],
          message: `chapter id "${ch.id}" 重复`,
        })
      }
      seenChapterIds.add(ch.id)
    })
    // 结局 id 不得重复
    const seenEndingIds = new Set<string>()
    story.endings.forEach((e, ei) => {
      if (seenEndingIds.has(e.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endings', ei, 'id'],
          message: `ending id "${e.id}" 重复`,
        })
      }
      seenEndingIds.add(e.id)
    })
    story.chapters.forEach((ch, ci) => {
      // 章内 beat id 不得重复
      const seenBeatIds = new Set<string>()
      ch.beats.forEach((b, bi) => {
        if (seenBeatIds.has(b.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['chapters', ci, 'beats', bi, 'id'],
            message: `beat id "${b.id}" 在本章内重复`,
          })
        }
        seenBeatIds.add(b.id)
      })
      const ids = new Set(ch.beats.map((b) => b.id))
      const edges = new Map<string, string[]>()
      ch.beats.forEach((b, bi) => {
        const hasChoices = !!b.choices
        const hasNext = b.next !== undefined
        if (hasChoices === hasNext) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['chapters', ci, 'beats', bi],
            message: `beat "${b.id}" 必须恰有 choices 或 next 之一`,
          })
          return
        }
        const tos = hasChoices
          ? b.choices!.map((c) => c.to)
          : typeof b.next === 'string'
            ? [b.next]
            : b.next!.map((n) => n.to)
        edges.set(b.id, tos)
        tos.forEach((to) => {
          if (to !== CHAPTER_END && !ids.has(to)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['chapters', ci, 'beats', bi],
              message: `beat "${b.id}" 引用了不存在的节点 "${to}"`,
            })
          }
        })
      })
      if (!ids.has(ch.entry)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['chapters', ci, 'entry'],
          message: `entry "${ch.entry}" 不在本章节点中`,
        })
        return
      }
      // 可达性 + 无环（DFS 三色标记）：白 0 / 灰 1 / 黑 2
      const color = new Map<string, number>()
      const visit = (id: string): void => {
        if (id === CHAPTER_END) return
        const c = color.get(id) ?? 0
        if (c === 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['chapters', ci],
            message: `第 ${ci + 1} 章 beat 图存在环（经过 "${id}"）`,
          })
          return
        }
        if (c === 2) return
        color.set(id, 1)
        for (const to of edges.get(id) ?? []) visit(to)
        color.set(id, 2)
      }
      visit(ch.entry)
      ch.beats.forEach((b) => {
        if (!color.has(b.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['chapters', ci],
            message: `beat "${b.id}" 从 entry 不可达`,
          })
        }
      })
    })
    // 兜底结局：恰好最后一个无 when
    story.endings.forEach((e, ei) => {
      const isLast = ei === story.endings.length - 1
      if (isLast !== (e.when === undefined)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endings', ei],
          message: '兜底结局有且仅有一个：最后一项无 when、其余必须有 when',
        })
      }
    })
  })

export type Story = z.infer<typeof storySchema>
export type Chapter = Story['chapters'][number]
export type Beat = Chapter['beats'][number]
export type Choice = NonNullable<Beat['choices']>[number]
export type NextRef = NonNullable<Beat['next']>
export type Ending = Story['endings'][number]
