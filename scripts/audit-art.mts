// 审计：无 art 字段的 beat / 有 slug 但缺文件的 beat
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { shanhe } from '../src/stories/shanhe'

// 按脚本自身位置推导仓库根（此前写死了旧目录名，目录一改就整份报 MISSING-FILE）
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const A = join(ROOT, 'src', 'assets', 'art') + '/'
for (const ch of shanhe.chapters)
  for (const b of ch.beats) {
    if (!b.art) console.log('NO-ART-FIELD', ch.id, b.id)
    else if (!fs.existsSync(A + b.art + '.webp')) console.log('MISSING-FILE', ch.id, b.id, b.art)
  }
console.log('audit done')
