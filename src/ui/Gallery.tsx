import type { Story } from '../stories/schema'
import { useLang } from './lang'

interface Props {
  story: Story
  onBack: () => void
}

// 卷末影像志：十二章章封所用历史档案照片的小影像馆——图、章题、出处一体呈现
export default function Gallery({ story, onBack }: Props) {
  const { tr } = useLang()
  return (
    <main className="gallery">
      <h2>{tr('影像志')} · {tr(story.title)}</h2>
      <p className="gallery-sub">
        {tr('各章章封影像均取自公有领域档案（Wikimedia Commons 等），出处随图注明。')}
      </p>
      {story.chapters.map((ch, i) => (
        <figure key={ch.id} className="gallery-item">
          {ch.art ? (
            <img src={`${import.meta.env.BASE_URL}covers/${ch.art}`} alt="" loading="lazy" />
          ) : (
            <div className="gallery-empty">{tr('影像从缺')}</div>
          )}
          <figcaption>
            <span className="gallery-title">
              {tr(`第${i + 1}章`)} · {tr(ch.title)}
            </span>
            {ch.artCredit && <span className="gallery-credit">{tr(ch.artCredit)}</span>}
          </figcaption>
          {(() => {
            // 补充影像 + 正文照片拍聚合陈列（按文件名去重——同图不重复入册）
            const seen = new Set<string>(ch.art ? [ch.art] : [])
            const items: { file: string; credit: string }[] = []
            for (const ex of ch.artExtra ?? []) {
              if (!seen.has(ex.file)) {
                seen.add(ex.file)
                items.push(ex)
              }
            }
            for (const b of ch.beats) {
              if (b.photo && !seen.has(b.photo.file)) {
                seen.add(b.photo.file)
                items.push(b.photo)
              }
            }
            return items.map((ex) => (
              <div key={ex.file} className="gallery-extra">
                <img src={`${import.meta.env.BASE_URL}covers/${ex.file}`} alt="" loading="lazy" />
                <span className="gallery-credit">{tr(ex.credit)}</span>
              </div>
            ))
          })()}
        </figure>
      ))}
      <button onClick={onBack}>{tr('返回')}</button>
    </main>
  )
}
