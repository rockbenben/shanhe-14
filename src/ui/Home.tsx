import type { Story } from '../stories/schema'
import { loadProgress, validProgress } from '../engine/storage'
import { useLang } from './lang'

export default function Home({ stories, onStart, onContinue }: {
  stories: Story[]
  onStart: (story: Story) => void
  onContinue: (story: Story) => void
}) {
  const { tr } = useLang()
  // 卷首视觉：档案照片按时间顺序连成整页胶片——十四年层层排开
  const strip = stories[0]?.chapters.filter((ch) => ch.art).map((ch) => ch.art!) ?? []
  return (
    <main className={strip.length ? 'home home--photo' : 'home'}>
      {strip.length > 0 && (
        <div className="home-strip" aria-hidden="true">
          {strip.map((f) => (
            <img key={f} src={`${import.meta.env.BASE_URL}covers/${f}`} alt="" loading="lazy" />
          ))}
        </div>
      )}
      {stories.map((s) => {
        const saved = validProgress(s, loadProgress(s.id))
        // 「继续」只在读到第二章之后出现——第一章内的进度不值得占一个按钮
        const resumable = saved && !saved.ended && saved.chapter > 0
        return (
          <section key={s.id} className="home-story">
            <h1 className="home-title">{tr(s.title)}</h1>
            <p className="home-sub">{tr(s.tagline)}</p>
            <div className="story-actions">
              {resumable && (
                <button className="story-primary" onClick={() => onContinue(s)}>
                  {tr(`继续 · 第 ${saved.chapter + 1} 章`)}
                </button>
              )}
              <button onClick={() => onStart(s)}>{tr(resumable ? '重新开始' : '进入')}</button>
            </div>
          </section>
        )
      })}
    </main>
  )
}
