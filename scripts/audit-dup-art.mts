// 审计：相邻拍同图（读感为“画面没换”）+ 同一插画被多拍复用的分布
import { shanhe } from '../src/stories/shanhe'

for (const ch of shanhe.chapters) {
  // 展开邻接边（choices 与 next 的全部指向）
  const edges: [string, string][] = []
  for (const b of ch.beats) {
    const tos = b.choices
      ? b.choices.map((c) => c.to)
      : typeof b.next === 'string'
        ? [b.next]
        : (b.next ?? []).map((n) => n.to)
    for (const to of tos) if (to !== '$end') edges.push([b.id, to])
  }
  const img = (id: string) => {
    const b = ch.beats.find((x) => x.id === id)!
    return b.photo ? 'photo:' + b.photo.file : b.art ? 'art:' + b.art : '(none)'
  }
  for (const [a, b] of edges) {
    if (img(a) === img(b) && img(a) !== '(none)') console.log(`ADJ-DUP ${ch.id} ${a}->${b} ${img(a)}`)
  }
  // slug 复用统计（仅 art 且无 photo 的拍）
  const usage = new Map<string, string[]>()
  for (const b of ch.beats) {
    if (b.photo || !b.art) continue
    usage.set(b.art, [...(usage.get(b.art) ?? []), b.id])
  }
  for (const [slug, ids] of usage) if (ids.length > 1) console.log(`MULTI ${ch.id} ${slug} <- ${ids.join(',')}`)
}
console.log('audit done')
