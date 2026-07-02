// 导出正文节点配图任务：beat 的 art slug + 中文叙事（供翻译成英文 scene prompt）
import { writeFileSync } from 'node:fs'
import { shanhe } from '../src/stories/shanhe'

const jobs: { s: string; n: string; f: string; zh: string; p: string }[] = []
for (const ch of shanhe.chapters) {
  for (const b of ch.beats) {
    if (!b.art || b.art.endsWith('.jpg')) continue
    jobs.push({ s: 'shanhe', n: `${ch.id}/${b.id}`, f: `${b.art}.webp`, zh: b.narrative, p: '' })
  }
}
writeFileSync(new URL('./_shanhe_jobs.json', import.meta.url), JSON.stringify(jobs, null, 1))
console.log(`dumped ${jobs.length} jobs`)
