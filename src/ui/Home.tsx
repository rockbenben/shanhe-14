import type { Story } from '../stories/schema'
import { loadProgress, validProgress } from '../engine/storage'
import { useLang } from './lang'

export default function Home({ stories, onStart, onContinue, onAbout }: {
  stories: Story[]
  onStart: (story: Story) => void
  onContinue: (story: Story) => void
  onAbout: () => void
}) {
  const { tr } = useLang()
  const story = stories[0]
  // 卷首签名元素：可读的十四年时间轴——每条切片一章，悬停亮起显年份章题；
  // ch10 无影像，是一条全黑切片（1942 · 影像从缺）——时间轴上的黑缝本身即叙事
  const slices = story?.chapters ?? []
  const saved = story ? validProgress(story, loadProgress(story.id)) : null
  const resumable = saved && !saved.ended && saved.chapter > 0
  return (
    <main className="home home--photo">
      <div className="home-strip" aria-hidden="true">
        {slices.map((ch, i) => (
          <div key={ch.id} className="home-slice" style={{ animationDelay: `${i * 90}ms` }}>
            {ch.art ? (
              <img src={`${import.meta.env.BASE_URL}covers/${ch.art}`} alt="" loading="lazy" />
            ) : (
              <div className="home-slice-void" />
            )}
            <span className="home-slice-label">
              {ch.era}
              <em>{tr(ch.art ? ch.title : '影像从缺')}</em>
            </span>
          </div>
        ))}
      </div>
      {story && (
        <section className="home-story">
          <h1 className="home-title home-title--spine">{tr(story.title)}</h1>
          <span className="home-seal" aria-label={tr('据史实与亲历记载改编')}>
            {tr('史实改编')}
          </span>
          <p className="home-sub">{tr(story.tagline)}</p>
          <div className="story-actions">
            {resumable && (
              <button className="story-primary" onClick={() => onContinue(story)}>
                {tr(`继续 · 第 ${saved!.chapter + 1} 章`)}
              </button>
            )}
            <button onClick={() => { const ch1 = saved && !saved.ended && saved.chapter === 0 && saved.beatId !== null; if (ch1) onContinue(story); else onStart(story) }}>{tr(resumable ? '重新开始' : '进入')}</button>
          </div>
        </section>
      )}
      <button className="home-about" onClick={onAbout}>
        {tr('关于本作')}
      </button>
    </main>
  )
}
