import type { Story } from '../stories/schema'
import { loadProgress, validProgress } from '../engine/storage'
import { useLang } from './lang'

export default function Home({ stories, onStart, onContinue }: {
  stories: Story[]
  onStart: (story: Story) => void
  onContinue: (story: Story) => void
}) {
  const { tr } = useLang()
  return (
    <main className="home">
      <h1 className="home-title">{tr('浮生长卷')}</h1>
      <p className="home-sub">{tr('编排式叙事 · 每一次选择都被长卷记得')}</p>
      {stories.map((s) => {
        const saved = validProgress(s, loadProgress(s.id))
        return (
          <section key={s.id} className={s.cover ? 'story-card story-card--photo' : 'story-card'}>
            {s.cover && (
              <div
                className="story-card-photo"
                style={{ backgroundImage: `url(${import.meta.env.BASE_URL}covers/${s.cover})` }}
                aria-hidden="true"
              />
            )}
            <div className="story-card-body">
              <h2>{tr(s.title)}</h2>
              <p>{tr(s.tagline)}</p>
              <div className="story-actions">
                <button onClick={() => onStart(s)}>{tr('从头开卷')}</button>
                {saved && !saved.ended && (
                  <button onClick={() => onContinue(s)}>{tr(`继续（第 ${saved.chapter + 1} 章）`)}</button>
                )}
              </div>
            </div>
          </section>
        )
      })}
    </main>
  )
}
