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
      <h1 className="home-title">{tr('浮生长卷')}</h1>
      <p className="home-sub">{tr('编排式叙事 · 每一次选择都被长卷记得')}</p>
      {stories.map((s) => {
        const saved = validProgress(s, loadProgress(s.id))
        // 「续读」只有在真正读进去之后才有意义（仍停在第一章封面＝等于从头）
        const resumable = saved && !saved.ended && (saved.chapter > 0 || saved.beatId !== null)
        return (
          <section key={s.id} className="story-card">
            <h2>{tr(s.title)}</h2>
            <p>{tr(s.tagline)}</p>
            <div className="story-actions">
              {resumable && (
                <button className="story-primary" onClick={() => onContinue(s)}>
                  {tr(`续读 · 第 ${saved.chapter + 1} 章`)}
                </button>
              )}
              <button onClick={() => onStart(s)}>{tr(resumable ? '从头再来' : '开卷')}</button>
            </div>
          </section>
        )
      })}
    </main>
  )
}
