// 审计：无 art 字段的 beat / 有 slug 但缺文件的 beat
import fs from 'node:fs'
import { shanhe } from '../src/stories/shanhe'

const A = 'D:/Backup/Libraries/Documents/GitHub/Projects/365/021/src/assets/art/'
for (const ch of shanhe.chapters)
  for (const b of ch.beats) {
    if (!b.art) console.log('NO-ART-FIELD', ch.id, b.id)
    else if (!fs.existsSync(A + b.art + '.webp')) console.log('MISSING-FILE', ch.id, b.id, b.art)
  }
console.log('audit done')
