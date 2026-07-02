import type { Story } from '../stories/schema'
import { loadProgress } from '../engine/storage'

interface Props {
  stories: Story[]
  onStart: (story: Story) => void
  onContinue: (story: Story) => void
}

export default function Home({ stories, onStart, onContinue }: Props) {
  return (
    <main className="home">
      <h1 className="home-title">浮生长卷</h1>
      <p className="home-sub">编排式叙事 · 每一次选择都被长卷记得</p>
      {stories.map((s) => {
        const saved = loadProgress(s.id)
        return (
          <section key={s.id} className="story-card">
            <h2>{s.title}</h2>
            <p>{s.tagline}</p>
            <div className="story-actions">
              <button onClick={() => onStart(s)}>从头开卷</button>
              {saved && !saved.ended && <button onClick={() => onContinue(s)}>继续（第 {saved.chapter + 1} 章）</button>}
            </div>
          </section>
        )
      })}
    </main>
  )
}
