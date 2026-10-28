// 导出正文节点配图任务：beat 的 art slug + 中文叙事 + 英文提示词（供生图用）
// 英文提示词按 slug 保留：重跑本脚本只刷新「节点/叙事」，不冲掉已写好的 prompt。
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { shanhe } from '../src/stories/shanhe'

const OUT = new URL('./_shanhe_jobs.json', import.meta.url)

// 已有清单里的英文提示词（按 slug 索引）
const prev = new Map<string, string>()
if (existsSync(OUT)) {
  for (const j of JSON.parse(readFileSync(OUT, 'utf8')) as { f: string; p: string }[]) {
    if (j.p) prev.set(j.f.replace(/\.webp$/, ''), j.p)
  }
}

const jobs: { s: string; n: string; f: string; zh: string; p: string }[] = []
for (const ch of shanhe.chapters) {
  for (const b of ch.beats) {
    if (!b.art || b.art.endsWith('.jpg')) continue
    jobs.push({ s: 'shanhe', n: `${ch.id}/${b.id}`, f: `${b.art}.webp`, zh: b.narrative, p: prev.get(b.art) ?? '' })
  }
}
writeFileSync(OUT, JSON.stringify(jobs, null, 1))
const missing = [...new Set(jobs.filter((j) => !j.p).map((j) => j.f.replace(/\.webp$/, '')))]
console.log(`dumped ${jobs.length} jobs · ${new Set(jobs.map((j) => j.f)).size} 张图`)
if (missing.length) console.log(`待补英文提示词 ${missing.length} 张：${missing.join(' ')}`)
